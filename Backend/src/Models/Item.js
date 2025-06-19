const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchNumber: {
    type: String,
    required: true,
    trim: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  stockQuantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  }
}, { _id: true }); // keeping _id enabled for traceability

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true,
  },
  gstRate: {
    type: Number,
    default: 0, // e.g., 5, 12, 18
  },
  hsnCode: {
    type: String,
    required: true,
    trim: true,
  },
  unit: {
    type: String,
    enum: ['tablet', 'bottle', 'strip', 'tube', 'injection','capsule'],
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BusinessProfile",
    required: true
  },
  batches: [batchSchema] // Embedded batch documents
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);

