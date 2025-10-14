const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv").config();
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const path = require("path");

// ✅ إنشاء التطبيق والسيرفر
const app = express();
const server = http.createServer(app);

// ✅ إعداد CORS
app.use(cors({
  origin: ["http://localhost:5173", "https://your-frontend-domain.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
connectDB();

// ✅ إعداد Socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://your-frontend-domain.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// ✅ الاتصال بـ Socket.io
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// ✅ تمرير io إلى الراوترات
const productRoutes = require("./routes/Product")(io);
const categoryRoutes = require("./routes/Category");
const userRoutes = require("./routes/Users");

app.use("/products", productRoutes);
app.use("/category", categoryRoutes);
app.use("/users", userRoutes);

// ✅ مجلد الصور
app.use("/images", express.static(path.join(__dirname, "images")));

// ✅ تشغيل السيرفر
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
