const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const app = express();

app.use(express.json())
 // Adjust path as needed

exports.auth = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Not authorized, token missing" });
    }

    const token = authHeader.split(" ")[1]; // Extract actual token from "Bearer <token>"

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
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



