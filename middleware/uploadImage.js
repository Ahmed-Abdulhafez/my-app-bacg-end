const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products", // المجلد داخل Cloudinary
    allowed_formats: ["jpeg", "png", "jpg", "webp"],
  },
});

const upload = multer({ storage });

module.exports = upload;
