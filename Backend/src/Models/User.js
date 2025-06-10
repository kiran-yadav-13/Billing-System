
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  // userId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   auto: true
  // },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: { 
    type: String, enum: ['admin', 'staff'], 
    default: 'staff' 
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessProfile' // Linking user to a business
  }
}, { timestamps: true });

  
// Hashing password before saving-
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token method- so that we can get current user loggedin id and it's other info whenver needed 
UserSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model("User", UserSchema);

