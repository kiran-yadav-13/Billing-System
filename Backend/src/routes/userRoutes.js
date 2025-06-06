const express = require("express");
const { register, login, logout, getProfile } = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/profile", auth, getProfile);

module.exports = router;
