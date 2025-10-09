const express = require("express");
const router = express.Router();

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
  });

  // حفظ المستخدم
  await newUser.save();

  //انشاء توكن
  let token = jwt.sign({ email, id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: "1w",
  });
  res
    .status(201)
    .json({ msg: "User Registered Successfully", user: newUser, token });
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
    let token = jwt.sign({ email, id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1w",
    });
    return res
      .status(201)
      .json({ msg: "User login Successfully", user, token });
  } else {
    return res.status(400).json({ msg: "Invalid email or password" });
  }
});

// جلب المستخدم من خلال الاي دي
router.get("/:id", async (req, res) =>{
  const user = await User.findById(req.params.id)
  if(!user){
    return res.status(404).json({msg: "User not found"})
  }
  return res.status(200).json({user})
})

module.exports = router;
