const mongoose = require("mongoose");

const b2bCustomerSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessProfile",
      required: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    gstNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    transactions: [
      {
        type: {
          type: String,
          enum: ["buy", "sell"],
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        items: [
          {
            item: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Item",
              required: true,
            },
            quantity: {
              type: Number,
              required: true,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("B2BCustomer", b2bCustomerSchema);



