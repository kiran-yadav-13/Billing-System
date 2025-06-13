const { z } = require("zod");

// GSTIN format: 15 characters - e.g., 22AAAAA0000A1Z5
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const businessProfileSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, { message: "Business name must be at least 2 characters long" })
    .max(100, { message: "Business name must not be more than 100 characters long" }),
  
  gstNumber: z
    .string()
    .trim()
    .regex(gstRegex, { message: "Invalid GST number format" }),

  address: z
    .string()
    .trim()
    .min(5, { message: "Address must be at least 5 characters long" })
    .max(200, { message: "Adress must not be more than 200 characters long" }),
  
  contactNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, { message: "Invalid Indian mobile number" }),

  logoUrl: z
    .string()
    .url({ message: "Logo must be a valid URL" })
    .optional(),
});
const updatebusinessSchema = businessProfileSchema.partial();
module.exports ={ businessProfileSchema,
  updatebusinessSchema
};