const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path"); // ✅ هذا هو الصحيح
const Product = require("../models/ProductSchema"); // استدعاء الموديل

// 📦 إنشاء منتج جديد (بعد رفع الصور إلى Cloudinary من الـ Frontend)
router.post("/createProduct", async (req, res) => {
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
      images, // روابط الصور من Cloudinary
    } = req.body;

    // ✅ التحقق من البيانات المطلوبة
    if (!title || !desc || !price || !category || !brand) {
      return res
        .status(400)
        .json({ msg: "Please provide all required fields" });
    }

    // ✅ تأكيد أن الصور وصلت كـ array
    const imageUrls = Array.isArray(images) ? images : [];

    // ✅ إنشاء المنتج الجديد
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
      images: imageUrls, // هنا بنخزن روابط Cloudinary
    });

    await newProduct.save();

    res
      .status(201)
      .json({ msg: "✅ Product created successfully", product: newProduct });
  } catch (error) {
    console.error("❌ Error creating product:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// جلب جميع المنتجات
router.get("/getProduct", async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// جلب منتج معين عن طريق الاي دي
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!product) {
      return res.status(404).json({ msg: "Product Not Found" });
    }
    return res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// تعديل منتج
router.put("/updateProduct/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("category", "name");

    if (!product) {
      return res.status(404).json({ msg: "Product Not Found" });
    }

    res.json({ msg: "Product Updated Successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// حذف منتج
router.delete("/deleteProduct/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Product Not Found" });
    }
    res.json({ msg: "Product deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
