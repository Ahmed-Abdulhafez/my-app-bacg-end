// routes/admin.js
const express = require("express");
const router = express.Router();
const { cookieAuth } = require("../auth/middelware");

router.get("/check", cookieAuth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied. Not an admin." });
  }

  res.json({
    msg: "✅ Admin authorized",
    user: req.user,
  });
});

module.exports = router;
