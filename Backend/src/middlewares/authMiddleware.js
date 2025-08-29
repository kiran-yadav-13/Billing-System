const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const app = express();

app.use(express.json())
 // Adjust path as needed

exports.auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) throw new Error("Not authorized, token missing");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) throw new Error("User not found");

    // If you store businessId in the user schema
    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({ success: false, error: "Not authorized" });
  }
};



// Role-based access (only for admin)
exports.adminOnly = (req, res, next) => {
  if ((req.user && req.user.role === "admin") || (req.user.role === "owner")) {
    next();
  } else {
    res.status(403).json({ success: false, error: "Access denied: Admins only" });
  }
};



