require("dotenv").config();
const express = require("express");
const router = express.Router();
const Product = require("../models/ProductSchema");
const {auth} = require("../auth/middelware");

const { v2: cloudinary } = require("cloudinary");
const multer = require("multer");
const streamifier = require("streamifier");
// const deleteFile = require("../config/cloudinary/deleteFile")

// ✅ إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("🔍 Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "✅ Loaded" : "❌ Missing",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "✅ Loaded" : "❌ Missing",
});

// ✅ إعداد multer لحفظ الصور مؤقتًا
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📦 إنشاء منتج جديد مع رفع الصور إلى Cloudinary
router.post("/createProduct",auth("admin"), upload.array("images", 10), async (req, res) => {
  try {
    const {
      title,
      desc,
      price,
      category,
      brand,
      stock,
      isFeatured,
      rating,
      numReviews,
    } = req.body;

    if (!title || !desc || !price || !category || !brand) {
      return res
        .status(400)
        .json({ msg: "Please provide all required fields" });
    }

    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "uploaded_products",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });

        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    const newProduct = new Product({
      title,
      desc,
      price,
      category,
      brand,
      stock: stock || 0,
      isFeatured: isFeatured || false,
      rating: rating || 0,
      numReviews: numReviews || 0,
      images: uploadedImages,
    });

    await newProduct.save();

    // 🚀 إرسال التحديث الفوري لكل العملاء المتصلين
    // io.emit("productsUpdated", newProduct);
    res.status(201).json({
      msg: "✅ Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// 📜 جلب جميع المنتجات
router.get("/getProduct", async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🧩 جلب منتج واحد
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!product) return res.status(404).json({ msg: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ تعديل المنتج
router.put("/:id", upload.array("images", 10), async (req, res) => {
  try {
    const { title, desc, price, brand, category, isFeatured } = req.body;

    // ✅ تجهيز الصور الجديدة (لو موجودة)
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => {
        return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      });
    }

    // ✅ بناء البيانات المعدلة
    const updateData = {
      title,
      desc,
      price,
      brand,
      category,
      isFeatured,
    };

    // ✅ إضافة الصور فقط لو فيه صور جديدة
    if (imageUrls.length > 0) {
      updateData.images = imageUrls;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ msg: "❌ المنتج غير موجود" });
    }

    res.json({ msg: "✅ تم تعديل المنتج بنجاح", product: updatedProduct });
  } catch (error) {
    console.error("❌ خطأ أثناء تعديل المنتج:", error.message);
    res.status(500).json({ msg: "حدث خطأ في السيرفر", error: error.message });
  }
});

// حذف منتج
// router.delete("/:id",deleteFile, async (req, res) => {
//   try {
//     const product = await Product.findByIdAndDelete(req.params.id);

//     if (!product) {
//       return res.status(404).json({ msg: "❌ Product not found" });
//     }

//     res.json({ msg: "✅ Product deleted successfully" });
//   } catch (error) {
//     console.error("❌ Error deleting product:", error);
//     res.status(500).json({ msg: "Server error", error: error.message });
//   }
// });

// ✅ حذف المنتج مع صوره
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: "❌ Product not found" });
    }

    // تحقق إن كان للمنتج صور بها publicId
    if (product.images && product.images.length > 0) {
      const publicIds = product.images.map(img => img.publicId).filter(Boolean); // تجاهل القيم الفارغة

      if (publicIds.length > 0) {
        const deletePromises = publicIds.map(id => cloudinary.uploader.destroy(id));
        await Promise.all(deletePromises);
        console.log("🗑️ Product images deleted from Cloudinary");
      }
    } else {
      console.log("ℹ️ المنتج لا يحتوي على صور لحذفها.");
    }

    // حذف المنتج من قاعدة البيانات
    await Product.findByIdAndDelete(req.params.id);
    console.log("✅ Product deleted from database.");

    res.json({ msg: "✅ Product and images deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});


module.exports = router;
