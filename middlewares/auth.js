// middleware/auth.js
const jwt = require("jsonwebtoken");

const auth = (requiredRole = null) => {
  return (req, res, next) => {
    const token = req.cookies.token; // ✅ التوكن من الكوكي

    if (!token) {
      return res.status(401).json({ msg: "Access denied. No token provided." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(400).json({ msg: "Invalid token." });
      }

      req.user = decoded;

      // ✅ التحقق من الدور
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ msg: "Access denied. Admins only." });
      }

      next();
    });
  };
};

module.exports = auth;
