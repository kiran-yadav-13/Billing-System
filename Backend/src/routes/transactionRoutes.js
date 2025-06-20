const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactionHistory,
  searchTransactions
} = require('../controllers/transactionControlller')

router.post('/', createTransaction);
router.get('/history/:customerId', getTransactionHistory);
router.get('/search', searchTransactions);

module.exports = router;
