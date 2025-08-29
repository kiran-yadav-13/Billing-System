const express = require('express');
const router = express.Router();
const {
  createTransaction,
  editTransaction,
  deleteTransaction,
  searchTransactions,
  getB2BTransactionHistory,
  generateInvoicePDF,
  getB2CTransactionHistory,
} = require('../controllers/transactionControlller');
const {auth,adminOnly}= require("../middlewares/authMiddleware");

// Create new transaction (B2B or B2C)
router.post('/', auth,createTransaction);

// Edit transaction (rollback previous stock, re-add updated)
router.put('/:id', auth,editTransaction);

// Delete a transaction
router.delete('/:id', deleteTransaction);

// Search transactions (by billNo, businessName, b2cName, date)
router.get('/search',auth, searchTransactions);

// Get B2B transaction history by customerId
router.get('/history/:customerId',auth, getB2BTransactionHistory);

//  Get B2C transaction history by name (and optional contact)
router.get('/history-b2c', auth,getB2CTransactionHistory);


router.get('/invoice/:id',auth, generateInvoicePDF);

module.exports = router;
