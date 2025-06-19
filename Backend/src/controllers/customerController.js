const B2BCustomer = require("../Models/Customer");
const { createB2BCustomerSchema, updateB2BCustomerSchema } = require("../validators/customerValidators");

// Create B2B Customer
exports.createB2BCustomer = async (req, res) => {
  try {
    const parsed = createB2BCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
    }

    const { gstNumber } = parsed.data;

    const exists = await B2BCustomer.findOne({ gstNumber });
    if (exists) {
      return res.status(400).json({ success: false, error: "Customer with this GST already exists" });
    }

    const customer = await B2BCustomer.create({
      ...parsed.data,
      businessId: req.user.businessId,
    });

    res.status(201).json({ success: true, message: "Customer created", data: customer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get All B2B Customers for Current Business
exports.getAllB2BCustomers = async (req, res) => {
  try {
    const customers = await B2BCustomer.find({ businessId: req.user.businessId });
    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get B2B Customer by ID
exports.getB2BCustomerById = async (req, res) => {
  try {
    const customer = await B2BCustomer.findOne({ _id: req.params.id, businessId: req.user.businessId });
    if (!customer) return res.status(404).json({ success: false, error: "Customer not found" });

    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update B2B Customer
exports.updateB2BCustomer = async (req, res) => {
  try {
    const parsed = updateB2BCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
    }

    const customer = await B2BCustomer.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      { $set: parsed.data },
      { new: true }
    );

    if (!customer) return res.status(404).json({ success: false, error: "Customer not found" });

    res.json({ success: true, message: "Customer updated", data: customer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete B2B Customer
exports.deleteB2BCustomer = async (req, res) => {
  try {
    const customer = await B2BCustomer.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
    if (!customer) return res.status(404).json({ success: false, error: "Customer not found" });

    res.json({ success: true, message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Search by Business Name
exports.searchB2BCustomer = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ success: false, error: "Search term required" });

    const regex = new RegExp(name, "i");
    const customers = await B2BCustomer.find({ businessName: regex, businessId: req.user.businessId });

    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

