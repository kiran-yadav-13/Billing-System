const Transaction = require('../Models/Transaction');
const Item = require('../Models/Item');
const B2BCustomer= require('../Models/Customer.js');
const BusinessProfile  = require('../Models/BusinessProfile');
const Counter = require('../Models/Counter');
const transactionValidator = require('../validators/transactionValidators');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require("path");


// Parse dd-mm-yyyy → Date object
function parseDate(ddmmyyyy) {
  const [dd, mm, yyyy] = ddmmyyyy.split('-').map(Number);
  return new Date(yyyy, mm - 1, dd);
}

const createTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  let committed = false;

  try {
    session.startTransaction();

    const businessId = req.user.businessId;
    const parsed = transactionValidator.parse(req.body);
    const { transactionType, mode, b2bCustomer, b2cCustomer, items } = parsed;

    let gstAmount = 0;
    let totalAmount = 0;

    const detailedItems = await Promise.all(items.map(async (i) => {
      const item = await Item.findOne({ _id: i.itemId, businessId }).session(session);
      if (!item) throw new Error('Item not found or unauthorized');

      const batch = item.batches.id(i.batchId);
      if (!batch) throw new Error(`Batch not found for item ${item.name}`);

      if (transactionType === 'sell') {
        if (batch.stockQuantity < i.quantity)
          throw new Error(`Insufficient stock in batch ${batch.batchNumber}`);
        batch.stockQuantity -= i.quantity;
      } else {
        batch.stockQuantity += i.quantity;
      }

      await item.save({ session });

      const gst = (batch.price * item.gstRate / 100) * i.quantity;
      const discount = batch.discount * i.quantity;
      const total = (batch.price * i.quantity) + gst - discount;

      gstAmount += gst;
      totalAmount += total;

      return {
        itemId: item._id,
        itemName: item.name,
        batchId: batch._id,
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        quantity: i.quantity,
        price: batch.price,
        gst: item.gstRate,
        discount: batch.discount,
      };
    }));

    const counter = await Counter.findOneAndUpdate(
      { name: 'transaction' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, session }
    );

    const transactionData = {
      billNo: counter.seq,
      transactionType,
      mode,
      businessId,
      items: detailedItems,
      totalAmount,
      gstAmount,
      finalAmount: totalAmount,
      ...(mode === 'b2b' ? { b2bCustomer } : { b2cCustomer }),
    };

    const newTransaction = await Transaction.create([transactionData], { session });

    if (mode === 'b2b') {
      const formattedItems = items.map(i => ({
        item: i.itemId,
        quantity: i.quantity
      }));

      const b2bUpdate = await Customer.findByIdAndUpdate(
        b2bCustomer,
        {
          $push: {
            transactions: {
              type: transactionType,
              date: new Date(),
              items: formattedItems
            }
          }
        },
        { session }
      );

      if (!b2bUpdate) throw new Error("B2B customer not found");
    }

    // ✅ Get populated result before committing
   let populated;

if (mode === 'b2b') {
  populated = await Transaction.findById(newTransaction[0]._id).populate({
    path: 'b2bCustomer',
    select: 'businessName gstNumber contactPerson contactNumber email address'
  });
} else {
  populated = newTransaction[0];

}

    await session.commitTransaction();
    committed = true;
    await session.endSession();

    res.status(201).json({ success: true, bill: populated });

  } catch (err) {
    if (!committed) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        console.error("Abort failed:", abortErr.message);
      }
    }
    await session.endSession();
    res.status(400).json({ success: false, message: err.message });
  }
};

const editTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const businessId = req.user.businessId;
    const transaction = await Transaction.findById(req.params.id).session(session);
    if (!transaction) throw new Error('Transaction not found');

    // Rollback stock
    for (const item of transaction.items) {
      const dbItem = await Item.findOne({ _id: item.itemId, businessId }).session(session);
      const batch = dbItem.batches.id(item.batchId);
      if (!batch) continue;
      batch.stockQuantity += transaction.transactionType === 'sell' ? item.quantity : -item.quantity;
      await dbItem.save({ session });
    }

    await Transaction.findByIdAndDelete(transaction._id).session(session);
    req.body.transactionType = transaction.transactionType;
    req.user.businessId = businessId;
    await createTransaction(req, res);

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: err.message });
  }
};


const searchTransactions = async (req, res) => {
  try {
    const { billNo, customer, fromDate, toDate, name, contact } = req.query;
    const businessId = req.user.businessId;
    const filter = { businessId };

    if (billNo) filter.billNo = parseInt(billNo);
    if (customer) filter.b2bCustomer = customer;
    if (name) filter['b2cCustomer.name'] = { $regex: new RegExp(name, 'i') };
    if (contact) filter['b2cCustomer.contact'] = contact;

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const results = await Transaction.find(filter).populate('b2bCustomer');
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const getB2BTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      businessId: req.user.businessId,
      b2bCustomer: req.params.customerId
    }).populate('b2bCustomer');
    res.status(200).json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getB2CTransactionHistory = async (req, res) => {
  try {
    const { name, contact } = req.query;
    const businessId = req.user.businessId;
    const filter = { businessId };

    if (name) filter['b2cCustomer.name'] = { $regex: new RegExp(name, 'i') };
    if (contact) filter['b2cCustomer.contact'] = contact;

    const transactions = await Transaction.find(filter);
    res.status(200).json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const deleteTransaction = async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// // Generate PDF invoice by bill ID
//uter.get('/invoice/:id', generateInvoicePDF);
const generateInvoicePDF = async (req, res) => {
  try {
    const bill = await Transaction.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    const business = await BusinessProfile.findById(bill.businessId);
    if (!business) return res.status(404).json({ success: false, message: 'Business not found' });

    const invoiceDir = path.join(__dirname, '../../invoices');
    if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir);

    const filename = `bill_${bill.billNo}.pdf`;
    const filepath = path.join(invoiceDir, filename);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(fs.createWriteStream(filepath));

    // 🏪 Business Name
    doc.fontSize(20).font('Helvetica-Bold').text(business.businessName.toUpperCase(), { align: 'center' });

    // 📅 Bill Info
    const billDate = new Date(bill.createdAt).toLocaleDateString('en-IN');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(`Bill No: ${bill.billNo}`, 40, doc.y, { align: 'left' });
    doc.text(`Date: ${billDate}`, -40, doc.y, { align: 'right' });

    doc.moveDown();

    
    // 👤 Customer Info (Supports both B2C and B2B)
    doc.moveDown(1);

// ✅ Add transaction type info in small text if B2B
if (bill.b2bCustomer) {
  doc.fontSize(10).font('Helvetica-Oblique').text(
    `Note: This is a ${bill.transactionType.toUpperCase()} transaction with the following business:`,
    40
  );
}
    doc.moveDown(1);
    doc.fontSize(12).font('Helvetica-Bold').text('Customer Details:', 40);
    doc.moveDown(1);
   const fieldRow = (label1, value1, label2, value2) => {
  const leftX = 40;
  const rightX = 300;
  const y = doc.y;

  if (label1 && value1) {
    doc.font('Helvetica-Bold').fontSize(12).text(`${label1}: `, leftX, y, { continued: true });
    doc.font('Helvetica').text(`${value1}`);
  }

  if (label2 && value2) {
    doc.font('Helvetica-Bold').fontSize(12).text(`${label2}: `, rightX, y, { continued: true });
    doc.font('Helvetica').text(`${value2}`);
  }

  doc.moveDown(0.5);
};
   if (bill.b2cCustomer) {
      const c = bill.b2cCustomer;
      fieldRow('Name', c.name, 'Contact', c.contact);
      fieldRow('Age', c.age, 'Doctor Name', c.doctorName);
      if (c.address) doc.font('Helvetica-Bold').fontSize(10).text(`Address: `, 40, doc.y, { continued: true });
      if (c.address) doc.font('Helvetica').text(`${c.address}`);
    } else if (bill.b2bCustomer) {
      const customer = await B2BCustomer.findById(bill.b2bCustomer);
      if (customer) {
        fieldRow('Business Name', customer.businessName, 'GST No.', customer.gstNumber);
        fieldRow('Contact Person', customer.contactPerson, 'Contact No.', customer.contactNumber);
        fieldRow('Email', customer.email, '', '');
        if (customer.address) doc.font('Helvetica-Bold').fontSize(10).text(`Address: `, 40, doc.y, { continued: true });
        if (customer.address) doc.font('Helvetica').text(`${customer.address}`);
      } else {
        doc.font('Helvetica').fontSize(10).text('Customer info not found', 40);
      }
    }

    doc.moveDown(2);


    // 📦 Table Headers
    const tableTop = doc.y + 10;
    const colX = {
      item: 50,
      batch: 170,
      expiry: 250,
      qty: 310,
      price: 360,
      gst: 420,
      discount: 470,
      total: 530,
    };

    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('Item', colX.item, tableTop);
    doc.text('Batch', colX.batch, tableTop);
    doc.text('Expiry', colX.expiry, tableTop);
    doc.text('Qty', colX.qty, tableTop);
    doc.text('Price', colX.price, tableTop);
    doc.text('GST%', colX.gst, tableTop);
    doc.text('Discount', colX.discount, tableTop);
    doc.text('Total', colX.total, tableTop);

    // 🔳 Divider line below header
    doc
      .moveTo(colX.item, tableTop + 15)
      .lineTo(colX.total + 50, tableTop + 15)
      .stroke();

    // 🧾 Table Rows
    let rowY = tableTop + 20;
    doc.font('Helvetica').fontSize(10);

    bill.items.forEach(i => {
      const expiry = new Date(i.expiryDate).toLocaleDateString('en-IN');

      doc.text(i.itemName, colX.item, rowY, { width: 100 });
      doc.text(i.batchNumber, colX.batch, rowY);
      doc.text(expiry, colX.expiry, rowY);
      doc.text(i.quantity.toString(), colX.qty, rowY);
      doc.text(`Rs. ${i.price}`, colX.price, rowY);
      doc.text(`${i.gst}%`, colX.gst, rowY);
      doc.text(`Rs. ${i.discount}`, colX.discount, rowY);

      const itemTotal = (i.price * i.quantity + (i.price * i.quantity * i.gst / 100) - i.discount).toFixed(2);
      doc.text(`Rs. ${itemTotal}`, colX.total, rowY);

      rowY += 20;
    });

    doc.moveDown(1);

    const totals = [
      { label: "Total", value: bill.totalAmount },
      { label: "GST", value: bill.gstAmount },
      { label: "Final Payable", value: bill.finalAmount }
    ];

    const totalLeft = 370;

    doc.moveDown(1.5);
    totals.forEach(t => {
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(`${t.label}:`, totalLeft, doc.y, { continued: true })
        .font('Helvetica')
        .text(`Rs. ${t.value.toFixed(2)}`)
        .moveDown(1);
    });

    doc.end();
    res.status(200).json({ success: true, path: `/invoices/${filename}` });
  } catch (err) {
    console.error("PDF error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};


// router.get('/invoice/:id', generateInvoicePDF);

module.exports = {
  createTransaction,
  editTransaction,
   getB2BTransactionHistory,
   getB2CTransactionHistory,
   deleteTransaction,
   generateInvoicePDF,
   searchTransactions
};
