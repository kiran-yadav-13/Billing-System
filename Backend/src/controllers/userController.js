const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const BusinessProfile = require("../Models/BusinessProfile");
const { registerUserSchema, loginUserSchema, updateUserSchema } = require("../validators/userValidators");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};


exports.register = async (req, res) => {
  try {
    const parsed=registerUserSchema.safeParse(req.body);
    if(!parsed.success){
      return res.status(400).json({
        success:false,
        error: parsed.error.flatten().fieldErrors,
      });
    }
    //const { name, email, password, role } = req.body;

    const { name, email, password, role } = parsed.data;

    // if (!name || !email || !password || !role) {
    //   return res.status(400).json({ success: false, error: "All fields are required" });
    // }

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
    const parsed=loginUserSchema.safeParse(req.body);
    if(!parsed.success){
      return res.status(400).json({
        sucess:false,
        error: parsed.error.flatten().fieldErrors,
      })
    }
    //const { email, password } = req.body;
    const { email, password } = parsed.data;
   
    // if (!email || !password) {
    //   return res.status(400).json({ success: false, error: "Email and password are required" });
    // }

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
   
    const parsed=registerUserSchema.safeParse(req.body);
    if(!parsed.sucess){
      return res.status(400).json({
        sucess:false,
        error:parsed.error.flatten().fieldErrors,
      });
    }
   

    const { name, email, password, role } = parsed.data;

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
    const userId = req.params.id;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const parsed=updateUserSchema.safeParse(req.body);
    if(!parsed.success){
      return res.status(400).json({
        success:false,
        error: parsed.error.flatten().fieldErrors,
      });
    }
    //const { name, email, password, role } = req.body;

    const { name, email, password, role } = parsed.data;

    // Update only the fields that are provided in the request
    if (name) existingUser.name = name;
    if (email) existingUser.email = email;
    if (role) existingUser.role = role;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      existingUser.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await existingUser.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {

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