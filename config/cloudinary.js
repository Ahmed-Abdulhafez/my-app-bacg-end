const { v2: cloudinary } = require("cloudinary");
const dotenv = require("dotenv").config();
const busboy = require("busboy");

// إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// دالة رفع الملفات إلى Cloudinary عبر stream
const streamAndUpload = async (req, res) => {
  try {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return res.status(400).json({ error: "Unsupported content type" });
    }

    const bb = busboy({ headers: req.headers });

    bb.on("file", (name, file, info) => {
      const { filename, mimeType } = info;
      console.log(`Uploading file: ${filename} with type: ${mimeType}`);

      // إنشاء stream رفع مباشر إلى Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "uploaded_files",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary error:", error);
            return res.status(400).json({ error: "File not uploaded" });
          }
          console.log("Upload result:", result);
          return res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );

      // تمرير بيانات الملف إلى Cloudinary
      file.pipe(uploadStream);
    });

    // تمرير الطلب إلى busboy لمعالجة الملفات
    req.pipe(bb);
  } catch (e) {
    console.error("Error:", e);
    return res.status(400).json({ error: "Cannot upload file" });
  }
};


// حذف ملف من Cloudinary
const deleteFile = async (req, res) => {
  try {
    const { public_id } = req.body; 

    if (!public_id) {
      return res.status(400).json({ error: "Bad request - public_id required" });
    }

    // حذف الصورة بناءً على public_id
    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === "not found") {
      return res.status(404).json({ error: "File not found" });
    }

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
      result,
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Cannot delete file" });
  }
};
module.exports = { streamAndUpload, deleteFile };
