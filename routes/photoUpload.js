const multer = require("multer");
const path = require("path");


// photo storage 
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// photo upload 
const photoUpload = multer({
    storage : photoStorage,
    fileFilter :function(req, file, cd) {
        if(file.mimetype.startsWith("image")) {
            cd(null, true)
        } else {
            cd({msg : "Unsupported file format"}, false)
        }
    },
    limits: {fileSize: 1024 * 1024 * 3} // 3 megabyte
})

module.exports = photoUpload;