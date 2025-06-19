const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  doctorName: {
    type: String,
    required: false,
    trim: true,
  },
  doctorRegistrationNumber: {
    type: String,
    required: false,
    trim: true,
  },
  prescribedItems: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Visit", visitSchema);
