//استدعاء المكتبات
//يعمل علي انشاء سيرفر
// const express = require('express');
// const app = express();
// const path = require("path");

//يعمل علي ربط السيرفر مع الفروت اند
// const cors = require('cors');

//يعمل علي قراءة المتغيرات من ملف .env
// const dotenv = require('dotenv').config();
// app.use(cors());

// للتعرف علي ال req and res
// app.use(express.json());

//استدعاء الراوت الخاص بالمستخدمين
// app.use("/users", require("./routes/Users"));

//استدعاء الراوت الخاص بالمنتجات
// app.use("/products", require("./routes/Product"));

//استدعاء الراوت الخاص category
// app.use("/category", require("./routes/Category"));

// app.use("/images", express.static(path.join(__dirname, "images")));
//يعمل علي الاتصال بقاعدة البيانات
// const connectDB = require('./config/db');
// connectDB();

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, ()=>{
//     console.log(`Server is running on port ${PORT}`);
// })

// استدعاء المكتبات
const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// تحميل المتغيرات من .env
dotenv.config();

// إنشاء السيرفر
const app = express();

// إعدادات أساسية
app.use(cors());
app.use(express.json());

// الاتصال بقاعدة البيانات
connectDB();

// مسارات الراوت
app.use("/users", require("./routes/Users"));
app.use("/products", require("./routes/Product"));
app.use("/category", require("./routes/Category"));

// لعرض الصور الثابتة
app.use("/images", express.static(path.join(__dirname, "images")));

// مسار اختبار (اختياري)
app.get("/", (req, res) => {
  res.send("✅ Server is running successfully on Vercel!");
});

// 👇 لاحظ إننا لا نستخدم app.listen هنا
module.exports = app;
