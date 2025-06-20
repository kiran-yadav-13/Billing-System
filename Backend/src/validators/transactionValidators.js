// validators/transactionValidator.js
const { z } = require('zod');
const mongoose = require('mongoose');

// Custom validator for MongoDB ObjectId
const objectId = z.string().refine(val => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
});

// Regex patterns
const nameRegex = /^[A-Za-z\s]{2,50}$/;
const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile numbers
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const transactionSchema = z.object({
  transactionType: z.enum(['buy', 'sell']),
  mode: z.enum(['b2b', 'b2c']),

  b2bCustomer: z.optional(objectId),

  b2cCustomer: z.optional(z.object({
    name: z.string().regex(nameRegex, { message: 'Name must contain only letters and spaces' }),
    contact: z.string().regex(phoneRegex, { message: 'Invalid contact number' }),
  })),

  items: z.array(z.object({
    itemId: objectId,
    quantity: z.number().min(1, { message: 'Quantity must be at least 1' }),
    price: z.number().min(0, { message: 'Price cannot be negative' }),
    gst: z.number().min(0).max(100, { message: 'GST must be between 0 and 100' }),
    discount: z.number().min(0).max(100, { message: 'Discount must be between 0 and 100' }),
  })).min(1, { message: 'At least one item is required' }),
});



module.exports = transactionSchema;
