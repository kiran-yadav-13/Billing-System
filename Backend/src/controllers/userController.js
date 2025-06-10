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
    await user.save(); // triggers pre-save hook for hashing

    const token = user.generateToken(); // using instance method

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

   
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    // If user not found or password is incorrect
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const token = user.generateToken();

    // Default redirect path
    let redirect = "/dashboard";

    // If no businessId and user is admin → needs to create business profile
    if (!user.businessId && user.role === "admin") {
      redirect = "/createBusinessProfile";
    }

    // If user has a businessId, check if business profile actually exists
    if (user.businessId) {
      const businessProfile = await BusinessProfile.findById(user.businessId);
      
      if (!businessProfile) {
        if (user.role === "admin") {
          redirect = "/createBusinessProfile"; // allow to create again
        } else {
          return res.status(400).json({
            success: false,
            error: "staff Assigned business profile does not exist",
          });
        }
      }
    }

    // Final response
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Login successful",
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          businessId: user.businessId || null,
        },
        redirect,
      });

  } catch (error) {
    console.error("Login error:", error.message);
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




//  Add staff user (Admin only)
exports.addUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

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
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

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