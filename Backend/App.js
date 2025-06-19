const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const userRoutes = require("./src/routes/userRoutes");
const businessRoutes = require('./src/routes/businessRoutes');
const itemRoutes=require('./src/routes/itemRoutes');
const b2bCustomer=require('./src/routes/customerRoutes');
const connectDB = require("./src/config/db");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/item',itemRoutes);
app.use("/api/b2bCustomer",b2bCustomer);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


