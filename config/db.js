const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("🚀 Trying to connect to MongoDB...");
    console.log("🔗 MONGO_URI:", process.env.MONGO_URI ? "✅ Loaded" : "❌ Missing");

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
