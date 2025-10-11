const express = require("express");
const multer = require("multer");
const { uploadToCloudinary } = require("../config/cloudinary");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {  // ✅ لاحظ هنا المسار "/"
  try {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });
    const result = await uploadToCloudinary(req.file.buffer, "uploaded_products");

    res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ success: false, msg: "Upload failed" });
  }
});

module.exports = router;
