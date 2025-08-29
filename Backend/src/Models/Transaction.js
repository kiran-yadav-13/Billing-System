const mongoose = require("mongoose");

// Sub-schema for each item in the transaction
const transactionItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  batchNumber: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  gst: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
    default: 0,
  }
}, { _id: false });

// Embedded B2C customer schema
const b2cCustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  contact: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
  },
  address: {
    type: String,
    trim: true,
  },
  doctorName: {
    type: String,
    trim: true,
  }
}, { _id: false });

// Main Transaction Schema
const transactionSchema = new mongoose.Schema({
  billNo: {
    type: Number,
    required: true,
    unique: true,
  },
  transactionType: {
    type: String,
    enum: ['buy', 'sell'],
    required: true,
  },
  mode: {
    type: String,
    enum: ['b2b', 'b2c'],
    required: true,
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessProfile',
    required: true,
  },
  b2bCustomer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'B2BCustomer',
  },
  b2cCustomer: {
    type: b2cCustomerSchema,
  },
  items: [transactionItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  gstAmount: {
    type: Number,
    required: true,
  },
  finalAmount: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);

