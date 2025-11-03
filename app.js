const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db");
const path = require("path");
const cookieParser = require("cookie-parser");
const cartRoutes = require("./routes/cart");


app.use(cookieParser());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://my-app-e-commerce.vercel.app",
    "https://front-end-cyan-five.vercel.app",
  ],
  credentials: true, // مهم جدًا علشان الكوكيز
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
connectDB();

// ✅ المسارات
app.use("/products", require("./routes/Product"));
app.use("/category", require("./routes/Category"));
app.use("/users", require("./routes/Users"));
app.use("/admin", require("./routes/admin"));
app.use("/cart", require("./routes/cart"));
app.use("/images", express.static(path.join(__dirname, "images")));


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
module.exports = app;
