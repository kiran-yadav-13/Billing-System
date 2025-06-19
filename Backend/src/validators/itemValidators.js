const { z } = require("zod");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

// Regular Expressions
const hsnCodeRegex = /^[0-9]{4,8}$/;
const batchNumberRegex = /^[A-Za-z0-9\-]{3,15}$/;
const manufacturerRegex = /^[A-Za-z0-9\s.,&()\-]{2,100}$/;
const validDateRegex = /^(\d{2}-\d{2}-\d{4}|\d{2}-\d{4})$/; // DD-MM-YYYY or MM-YYYY

// Expiry Date Transformer
const expiryDateTransformer = z
  .string()
  .regex(validDateRegex, "Expiry date must be in DD-MM-YYYY or MM-YYYY format")
  .transform((str) => {
    if (/^\d{2}-\d{4}$/.test(str)) {
      return dayjs(`01-${str}`, "DD-MM-YYYY").endOf("month").toDate();
    }
    return dayjs(str, "DD-MM-YYYY").toDate();
  });

// Schema for a single batch
const batchSchema = z.object({
  batchNumber: z.string()
    .min(3, "Batch number too short")
    .max(15, "Batch number too long")
    .regex(batchNumberRegex, "Invalid batch number format"),

  expiryDate: expiryDateTransformer,

  price: z.number()
    .positive("Price must be a positive number"),

  discount: z.number()
    .min(0, "Discount can't be negative")
    .max(100, "Discount can't exceed 100")
    .optional(),

  stockQuantity: z.number()
    .int("Stock must be a whole number")
    .nonnegative("Stock can't be negative"),
});

// Create Item Schema
exports.createItemSchema = z.object({
  name: z.string().min(1, "Item name is required").trim(),

  manufacturer: z.string()
    .min(2)
    .max(100)
    .regex(manufacturerRegex, "Manufacturer name contains invalid characters")
    .trim(),

  hsnCode: z.string()
    .regex(hsnCodeRegex, "HSN code must be 4 to 8 digits"),

  gstRate: z.number()
    .min(0, "GST rate can't be negative")
    .max(100, "GST rate can't exceed 100"),

  unit: z.enum(['tablet', 'bottle', 'strip', 'tube', 'injection','capsule'], {
    errorMap: () => ({ message: "Invalid unit" })
  }),

  description: z.string().optional(),

  batches: z.array(batchSchema).min(1, "At least one batch is required"),
});

// Partial version for update
exports.updateItemSchema = exports.createItemSchema.partial();

// Update specific batch
exports.batchUpdateSchema = z.object({
  batchNumber: z.string().min(3).max(15).optional(),
  expiryDate: expiryDateTransformer.optional(),
  stockQuantity: z.number().int().nonnegative().optional(),
  price: z.number().positive().optional(),
  discount: z.number().min(0).max(100).optional()
});
