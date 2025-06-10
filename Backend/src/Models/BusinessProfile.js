const mongoose = require("mongoose");

const BusinessProfileSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
  },
  gstNumber: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  logoUrl: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("BusinessProfile", BusinessProfileSchema);

