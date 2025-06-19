const express = require("express");
const router = express.Router();

const {
  createB2BCustomer,
  getAllB2BCustomers,
  getB2BCustomerById,
  updateB2BCustomer,
  deleteB2BCustomer,
  searchB2BCustomer
} = require("../controllers/customerController");

const { auth } = require("../middlewares/authMiddleware");

// Routes
router.post("/create", auth, createB2BCustomer);
router.get("/getall", auth, getAllB2BCustomers);
router.get("/getById/:id", auth, getB2BCustomerById);
router.put("/update/:id", auth, updateB2BCustomer);
router.delete("/delete/:id", auth, deleteB2BCustomer);
router.get("/search", auth, searchB2BCustomer); // ?name=Medico

module.exports = router;
