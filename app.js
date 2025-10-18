const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db");
const path = require("path");

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "https://my-app-e-commerce.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
connectDB();

// ✅ المسارات
app.use("/products", require("./routes/Product"));
app.use("/category", require("./routes/Category"));
app.use("/users", require("./routes/Users"));

app.use("/images", express.static(path.join(__dirname, "images")));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
module.exports = app;
