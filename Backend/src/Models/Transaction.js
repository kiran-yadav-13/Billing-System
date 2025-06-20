
const mongoose = require('mongoose');


const transactionItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemName: String,
  batchNumber: String,
  expiryDate: Date,
  quantity: Number,
  price: Number,
  gst: Number,
  discount: Number,
});

const transactionSchema = new mongoose.Schema({
  billNo: { type: Number, unique: true },
  transactionType: { type: String, enum: ['buy', 'sell'], required: true },
  mode: { type: String, enum: ['b2b', 'b2c'], required: true },

  b2bCustomer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: function() { return this.mode === 'b2b'; } },
  b2cCustomer: {
    name: String,
    contact: String,
  },

  items: [transactionItemSchema],

  totalAmount: Number,
  gstAmount: Number,
  finalAmount: Number,

  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);
