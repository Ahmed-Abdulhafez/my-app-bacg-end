const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db");
const path = require("path");
const cookieParser = require("cookie-parser");
const cartRoutes = require("./routes/cart");


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://e-commerce-lyart-kappa-73.vercel.app",
  "https://my-app-e-commerce.vercel.app",
  "https://front-end-cyan-five.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // السماح للطلبات الداخلية أو من origins محددة
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ لازم تضيف ده بعد الـ cors مش قبل
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

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
