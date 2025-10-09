const express = require("express");
const router = express.Router();

const Category = require("../models/CategorySchema");

// إنشاء فئة جديدة
router.post("/createCategory", async (req, res) => {
  try {
    const { name } = req.body;

    // التحقق من البيانات المطلوبة
    if (!name) {
      return res.status(400).json({ msg: "Please provide category name" });
    }

    // إنشاء الفئة الجديدة
    const newCategory = new Category({ name });

    // حفظ الفئة
    await newCategory.save();

    res.status(201).json({
      msg: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// جلب جميع الفئات
router.get("/getCategory", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// جلب منتج معين عن طريق الاي دي
router.get("/:id", async (req, res) => {
  try {
    const Category = await Category.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!Category) {
      return res.status(404).json({ msg: "Category Not Found" });
    }
    return res.json(Category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
