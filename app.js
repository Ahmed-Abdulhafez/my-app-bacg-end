const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db");
const path = require("path");
const cookieParser = require("cookie-parser");
const cartRoutes = require("./routes/cart");


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://e-commerce-lyart-kappa-73.vercel.app", // 👈 تأكد إن ده دومين الفرونت الحقيقي على Vercel
      "https://my-app-e-commerce.vercel.app",
      "https://front-end-cyan-five.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // ✅ مهم جدًا
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ السماح للهيدر الخاص بالتوكن
    credentials: true, // ✅ ضروري جدًا علشان الكوكي تشتغل
  })
);

// ✅ مهم جدًا لتجنب مشاكل preflight (OPTIONS)
app.options("*", cors());

app.use(cookieParser());

app.use(express.json());
connectDB();

// ✅ المسارات
app.use("/products", require("./routes/Product"));
app.use("/category", require("./routes/Category"));
app.use("/users", require("./routes/Users"));
app.use("/admin", require("./routes/admin"));
app.use("/cart", require("./routes/cart"));
app.use("/images", express.static(path.join(__dirname, "images")));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
module.exports = app;
