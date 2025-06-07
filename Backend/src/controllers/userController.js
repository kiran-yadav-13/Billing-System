const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const BusinessProfile = require("../Models/BusinessProfile");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// @desc Register user
// @route POST /api/users/signup
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = generateToken(user._id);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",
        user: { name: user.name, email: user.email, role: user.role },
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Login user
// @route POST /api/users/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    // Check if business profile exists for this user
    const businessProfile = await BusinessProfile.findOne({ userId: user._id });

    const redirectPath = user.role === "admin" && !businessProfile
      ? "/createBusinessProfile"
      : "/dashboard";

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Login successful",
        user: { name: user.name, email: user.email, role: user.role },
        redirect: redirectPath,
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Get logged-in user + business profile
// @route GET /api/users/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const businessProfile = await BusinessProfile.findOne({ userId: req.user.id });

    res.json({ success: true, user, businessProfile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



exports.logout = (req, res) => {
  res.clearCookie("token").json({ success: true, message: "Logged out successfully" });
};

