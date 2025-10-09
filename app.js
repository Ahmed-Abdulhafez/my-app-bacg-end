// //استدعاء المكتبات
// //يعمل علي انشاء سيرفر
// const express = require('express');
// const app = express();
// const path = require("path");

// //يعمل علي ربط السيرفر مع الفروت اند
// const cors = require('cors');

// //يعمل علي قراءة المتغيرات من ملف .env
// const dotenv = require('dotenv').config();
// app.use(cors());

// // للتعرف علي ال req and res
// app.use(express.json());

// //استدعاء الراوت الخاص بالمستخدمين
// app.use("/users", require("./routes/Users"));

// //استدعاء الراوت الخاص بالمنتجات
// app.use("/products", require("./routes/Product"));

// //استدعاء الراوت الخاص category
// app.use("/category", require("./routes/Category"));

// app.use("/images", express.static(path.join(__dirname, "images")));
// //يعمل علي الاتصال بقاعدة البيانات
// const connectDB = require('./config/db');
// connectDB();

// module.exports = app;

// استدعاء المكتبات
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv").config();

// إعداد الـ CORS
app.use(cors());

// قراءة بيانات JSON من الـ req.body
app.use(express.json());

// 🔹 استدعاء الاتصال بقاعدة البيانات
const connectDB = require("./config/db");
connectDB();

// 🔹 استدعاء وتهيئة Cloudinary
const { connectCloudinary } = require("./config/cloudinary");
connectCloudinary();

// 🔹 تعريف المسارات (Routes)
app.use("/users", require("./routes/Users"));
app.use("/products", require("./routes/Product"));
app.use("/category", require("./routes/Category"));

// 🔹 إذا أردت إبقاء الصور المحلية مؤقتًا
app.use("/images", express.static(path.join(__dirname, "images")));

// 🔹 في حالة حدوث أي خطأ غير متوقع
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ msg: "Server Error", error: err.message });
});

// 🔹 تصدير التطبيق
module.exports = app;
