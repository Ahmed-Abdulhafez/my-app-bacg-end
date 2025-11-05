const express = require("express");
const router = express.Router();
// استيراد ميدل وير التحقق من التوكن
const { cookieAuth } = require("../auth/middelware");
// استيراد موديل المستخدم
const User = require("../models/UserSchema");
// استيراد مكتبة التشفير
const bcrypt = require("bcryptjs");
// استيراد مكتبة jwt
const jwt = require("jsonwebtoken");

//انشاء مستخدم جديد
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  //التحقق من وجود المستخدم
  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ msg: "User Already Exists" });
  }

  // تشفير كلمة المرور
  const hashedPassword = await bcrypt.hash(password, 10);
  // انشاء مستخدم جديد ان لم يكن موجود
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role: "user", // تعيين دور افتراضي للمستخدم
  });

  // حفظ المستخدم
  await newUser.save();

  //انشاء توكن
  let token = jwt.sign(
    { email, id: newUser._id, role: newUser.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "1w",
    }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // تأمين الكوكيز في بيئة الإنتاج
    sameSite: "lax", // منع CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // مدة صلاحية الكوكيز (1 أسبوع)
  });
  res.status(201).json({
    msg: "User Registered Successfully",
    user: newUser,
    token,
    role: newUser.role,
  });
});

//تسجيل دخول المستخدم
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }
  //التحقق من وجود المستخدم
  let user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    const role = user.role || "user"; // تعيين دور افتراضي للمستخدم
    let token = jwt.sign(
      { email, id: user._id, role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1w",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // ضروري لأي موقع على HTTPS (مثل Vercel)
      sameSite: "none", // ضروري حتى يتم تبادل الكوكي بين النطاقين
      maxAge: 7 * 24 * 60 * 60 * 1000, // أسبوع
    });

    const redirectPath = role === "admin" ? "/Dashboard" : "/";

    return res.status(201).json({
      msg: "User login Successfully",
      user,
      token,
      role,
      redirect: redirectPath,
    });
  } else {
    return res.status(400).json({ msg: "Invalid email or password" });
  }
});

// التحقق من التوكن و جلب بيانات المستخدم
router.get("/verify", cookieAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }
    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(401).json({ msg: "Invalid Token" });
  }
});

// تسجيل خروج المستخدم
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,          // ضروري جداً مع HTTPS (Vercel بيستخدم HTTPS)
    sameSite: "none",      // مهم جداً علشان الكوكي يتمسح عبر دومينات مختلفة
  });
  return res.status(200).json({ msg: "✅ Logged out successfully" });
});

// جلب المستخدم من خلال الاي دي
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }
  return res.status(200).json({ user });
});

module.exports = router;
