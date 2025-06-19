const { z } = require("zod");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/;
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

exports.createB2BCustomerSchema = z.object({
  businessName: z.string().min(2, "Business name is required").trim(),
  gstNumber: z.string().regex(gstRegex, "Invalid GST number"),
  contactPerson: z.string().min(2).max(50).optional(),
  contactNumber: z.string().regex(phoneRegex, "Invalid contact number").optional(),
  email: z.string().email("Invalid email format").regex(emailRegex, "Invalid email").optional(),
  address: z.string().min(5).optional(),
});

exports.updateB2BCustomerSchema = exports.createB2BCustomerSchema.partial();
