const Transaction = require('../Models/Transaction');
const Item = require('../Models/Item');
const Customer = require('../Models/Customer');
const Counter = require('../Models/Counter');
const transactionValidator = require('../validators/transactionValidators');
const mongoose = require('mongoose');

// Parse dd-mm-yyyy → Date object
function parseDate(ddmmyyyy) {
  const [dd, mm, yyyy] = ddmmyyyy.split('-').map(Number);
  return new Date(yyyy, mm - 1, dd);
}

const createTransaction = async (req, res) => {
  try {
    const parsed = transactionValidator.parse(req.body);
    const { transactionType, mode, b2bCustomer, b2cCustomer, items } = parsed;

    let gstAmount = 0;
    let totalAmount = 0;

    const detailedItems = await Promise.all(items.map(async (i) => {
      const item = await Item.findById(i.itemId);
      if (!item) throw new Error('Item not found');

      const parsedExpiryDate = parseDate(i.expiryDate);

      // Match batch by number and expiry
      const batch = item.batches.find(
        b => b.batchNumber === i.batchNumber &&
             new Date(b.expiryDate).toDateString() === parsedExpiryDate.toDateString()
      );

      if (!batch) {
        throw new Error(`Batch ${i.batchNumber} with expiry ${i.expiryDate} not found for item ${item.name}`);
      }

      if (transactionType === 'sell') {
        if (batch.stockQuantity < i.quantity) {
          throw new Error(`Not enough stock in batch ${batch.batchNumber} for item ${item.name}`);
        }
        batch.stockQuantity -= i.quantity;
      } else if (transactionType === 'buy') {
        batch.stockQuantity += i.quantity;
      }

      await item.save();

      const gst = (i.price * i.gst / 100) * i.quantity;
      const discount = i.discount * i.quantity;
      const total = (i.price * i.quantity) + gst - discount;

      gstAmount += gst;
      totalAmount += total;

      return {
        itemId: item._id,
        itemName: item.name,
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        quantity: i.quantity,
        price: i.price,
        gst: i.gst,
        discount: i.discount,
      };
    }));

    const finalAmount = totalAmount;

    const counter = await Counter.findOneAndUpdate(
      { name: 'transaction' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const transactionData = {
      billNo: counter.seq,
      transactionType,
      mode,
      items: detailedItems,
      totalAmount,
      gstAmount,
      finalAmount,
    };

    if (mode === 'b2b') {
      transactionData.b2bCustomer = b2bCustomer;
    } else {
      transactionData.b2cCustomer = b2cCustomer;
    }

    const newTransaction = await Transaction.create(transactionData);

    if (mode === 'b2b') {
      await Customer.findByIdAndUpdate(b2bCustomer, {
        $push: { transactions: newTransaction._id },
      });
    }

    const populatedTransaction = await Transaction.findById(newTransaction._id)
      .populate({
        path: 'b2bCustomer',
        select: 'businessName gstNumber contactPerson contactNumber email address',
      });

    res.status(201).json({ success: true, bill: populatedTransaction });

  } catch (err) {
    console.error('Transaction error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};


// 2. Get Transaction History for B2B Customer
const getTransactionHistory = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ success: false, message: 'Invalid customer ID' });
    }

    const transactions = await Transaction.find({ b2bCustomer: customerId })
      .populate('b2bCustomer', 'businessName contactPerson contactNumber')
      .sort({ date: -1 });

    res.status(200).json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Search Transactions
const searchTransactions = async (req, res) => {
  try {
    const { billNo, b2bCustomer, startDate, endDate } = req.query;
    const query = {};

    if (billNo) query.billNo = Number(billNo);
    if (b2bCustomer && mongoose.Types.ObjectId.isValid(b2bCustomer)) {
      query.b2bCustomer = b2bCustomer;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const results = await Transaction.find(query)
      .populate('b2bCustomer', 'businessName')
      .sort({ date: -1 });

    res.status(200).json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createTransaction,
  getTransactionHistory,
  searchTransactions
};
