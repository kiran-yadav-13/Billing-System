const jwt = require("jsonwebtoken");
const User = require("../Models/User");

exports.auth= async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) throw new Error("Not authorized, token missing");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    res.status(401).json({ success: false, error: "Not authorized" });
  }
};
// Role-based access (only for admin)
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, error: "Access denied: Admins only" });
  }
};

