// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path"); // ✅ هذا هو الصحيح
// const Product = require("../models/ProductSchema"); // استدعاء الموديل

// // إعداد التخزين للصور
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./images");
//   },
//   filename: function (req, file, cb) {
//     const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueName + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage: storage });

// // 📦 إنشاء منتج جديد مع رفع عدة صور
// router.post("/createProduct", upload.array("images", 5), async (req, res) => {
//   try {
//     const {
//       title,
//       desc,
//       price,
//       category,
//       brand,
//       stock,
//       isFeatured,
//       rating,
//       numReviews,
//     } = req.body;

//     // التحقق من البيانات المطلوبة
//     if (!title || !desc || !price || !category || !brand) {
//       return res
//         .status(400)
//         .json({ msg: "Please provide all required fields" });
//     }

//     // حفظ مسارات الصور (لو في صور)
//     const imagePaths = req.files
//       ? req.files.map(
//           (file) =>
//             `${req.protocol}://${req.get("host")}/images/${file.filename}`
//         )
//       : [];

//     // إنشاء المنتج الجديد
//     const newProduct = new Product({
//       title,
//       desc,
//       price,
//       category,
//       brand,
//       stock: stock || 0,
//       isFeatured: isFeatured || false,
//       rating: rating || 0,
//       numReviews: numReviews || 0,
//       images: imagePaths,
//     });

//     await newProduct.save();

//     res
//       .status(201)
//       .json({ msg: "Product created successfully", product: newProduct });
//   } catch (error) {
//     console.error("Error creating product:", error.message);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// // جلب جميع المنتجات
// router.get("/getProduct", async (req, res) => {
//   try {
//     const products = await Product.find().populate("category", "name");
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // جلب منتج معين عن طريق الاي دي
// router.get("/:id", async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id).populate(
//       "category",
//       "name"
//     );
//     if (!product) {
//       return res.status(404).json({ msg: "Product Not Found" });
//     }
//     return res.json(product);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // تعديل منتج
// router.put("/updateProduct/:id", async (req, res) => {
//   try {
//     const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     }).populate("category", "name");

//     if (!product) {
//       return res.status(404).json({ msg: "Product Not Found" });
//     }

//     res.json({ msg: "Product Updated Successfully", product });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // حذف منتج
// router.delete("/deleteProduct/:id", async (req, res) => {
//   try {
//     const product = await Product.findByIdAndDelete(req.params.id);
//     if (!product) {
//       return res.status(404).json({ msg: "Product Not Found" });
//     }
//     res.json({ msg: "Product deleted Successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const fs = require("fs");
const Product = require("../models/ProductSchema");
const upload = require("../config/multer");
const { cloudinary } = require("../config/cloudinary");

// 📦 إنشاء منتج جديد مع رفع الصور إلى Cloudinary
router.post("/createProduct", upload.array("images", 5), async (req, res) => {
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
      return res.status(400).json({ msg: "Please provide all required fields" });
    }

    // رفع الصور إلى Cloudinary واحدة واحدة
    const imageUrls = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "myWebsiteUploads",
      });
      imageUrls.push(result.secure_url);
      fs.unlinkSync(file.path); // حذف الصورة من السيرفر بعد الرفع
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
      images: imageUrls,
    });

    await newProduct.save();
    res.status(201).json({ msg: "✅ Product created successfully", product: newProduct });
  } catch (error) {
    console.error("❌ Error creating product:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// باقي الراوتر كما هو 👇
router.get("/getProduct", async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name");
    if (!product) return res.status(404).json({ msg: "Product Not Found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/updateProduct/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("category", "name");
    if (!product) return res.status(404).json({ msg: "Product Not Found" });
    res.json({ msg: "Product Updated Successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/deleteProduct/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product Not Found" });
    res.json({ msg: "Product deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
