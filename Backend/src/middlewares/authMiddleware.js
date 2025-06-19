const jwt = require("jsonwebtoken");
const User = require("../Models/User");

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

exports.adminOnly = (req, res, next) => {
  if (req.user?.role === "admin") {
    return next();
  }
  res.status(403).json({ success: false, error: "Access denied: Admins only" });
};
