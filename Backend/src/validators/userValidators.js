const {z} =require("zod");
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{6,}$/;

const loginUserSchema=z.object({
    email:z
    .string()
    .trim()
    .email("Email must be valid"),

    password:z
    .string()
    .trim()
    .min(6,"password must be 6 characters long")
    .max(20,"password must not be more than 20 characters long")
    .regex(passwordRegex,
        "Password must include at least 1 uppercase letter, 1 number, and 1 special character"
    ),
});

const registerUserSchema=loginUserSchema.extend({
    name:z.string().min(1, "Name is required").max(60,"name cannot be more than 60 characters long"),
    role:z.enum(["admin","staff"],{message:"Role must either be admin or staff"})
});

const updateUserSchema = registerUserSchema.partial();
module.exports={
    registerUserSchema,
    loginUserSchema,
    updateUserSchema,
};