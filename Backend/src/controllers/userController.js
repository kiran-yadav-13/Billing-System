const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const BusinessProfile = require("../Models/BusinessProfile");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};


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

    const user = new User({ name, email, password, role });
    await user.save(); 
    res
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


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const token = user.generateToken();

    // Send token in response body instead of cookie
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId || null,
      },
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const businessProfile = await BusinessProfile.findOne({ userId: req.user.id });

    res.json({ success: true, user, businessProfile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//  Add staff user (Admin only)
exports.addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      password,
      role,
      businessId: req.user.businessId, // set same businessId as logged-in admin
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User added successfully",
      user: { _id:newUser._id,name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//  Get all users under the same business
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ businessId: req.user.businessId }).select("-password");
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//  Update user (Admin only)
exports.updateUser = async (req, res) => {
  try {
    //const user=await User.findById(req.user._id)
    const { id } = req.params;
    const { name, email, role } = req.body;

    user = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, message: "User updated", user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};