const jwt = require("jsonwebtoken");

const auth = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      let token = req.header("authorization");

      if (!token) {
        return res.status(401).json({ msg: "Access denied. No token provided." });
      }

      // 🔹 إزالة كلمة "Bearer "
      token = token.split(" ")[1];

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(400).json({ msg: "Invalid token." });
        }

        req.user = decoded;

        // 🔹 التحقق من الدور (role)
        if (requiredRole && decoded.role !== requiredRole) {
          return res.status(403).json({ msg: "Access denied. Insufficient permissions." });
        }

        next(); // ✅ لازم تكون هنا داخل التحقق الناجح
      });
    } catch (error) {
      console.error("Auth middleware error:", error);
      res.status(401).json({ msg: "Server error in auth middleware." });
    }
  };
};


const cookieAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      console.log("⚠️ No token found in cookies");
      return res.status(401).json({ msg: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ cookieAuth error:", error.message);
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};


module.exports = {auth , cookieAuth};
