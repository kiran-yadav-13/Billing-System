
const { z } = require('zod');
const mongoose = require('mongoose');

const objectId = z.string().refine(val => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId format',
});

const transactionValidator = z.object({
  transactionType: z.enum(['buy', 'sell'], {
    required_error: 'Transaction type is required',
    invalid_type_error: 'Must be "buy" or "sell"',
  }),
  mode: z.enum(['b2b', 'b2c'], {
    required_error: 'Mode must be b2b or b2c',
  }),
 

  // Optional if mode is b2b
  b2bCustomer: z.optional(objectId),

  // Optional if mode is b2c
  b2cCustomer: z.optional(z.object({
    name: z.string()
      .min(1, 'Name is required')
      .regex(/^[A-Za-z ]+$/, 'Only alphabets and spaces allowed'),
    contact: z.string()
      .regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
    age: z.optional(z.number().int().min(0, 'Min age 0').max(120, 'Max age 120')),
    address: z.optional(z.string().max(200, 'Max 200 characters')),
    doctorName: z.optional(z.string()
      .max(100, 'Max 100 characters')),
  })),

  items: z.array(z.object({
    itemId: objectId,
    batchId: objectId,
    quantity: z.number()
      .int({ message: 'Quantity must be integer' })
      .positive({ message: 'Quantity must be positive' })
      .lte(100000, { message: 'Quantity too large' }),
  })).min(1, 'At least one item is required'),
});

module.exports = transactionValidator;


