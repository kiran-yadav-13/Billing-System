const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const userRoutes = require("./src/routes/userRoutes");
const businessRoutes = require('./src/routes/businessRoutes');
const connectDB = require("./src/config/db");
const cors = require("cors");


dotenv.config();
connectDB();

const app = express();
app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true, // if using cookies or auth headers
}));

app.use("/api/users", userRoutes);
app.use('/api/business', businessRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


