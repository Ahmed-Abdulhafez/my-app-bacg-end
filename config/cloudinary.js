const { v2: cloudinary } = require("cloudinary");
const dotenv = require("dotenv").config();

// إعداد بيانات Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// دالة رفع الصور عبر stream
const uploadToCloudinary = async (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

// حذف ملف من Cloudinary
const deleteFromCloudinary = async (public_id) => {
  return cloudinary.uploader.destroy(public_id);
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
