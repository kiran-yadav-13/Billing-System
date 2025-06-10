const express = require("express");

const {
  register,
  login,
  logout,
  getProfile,
  addUser,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const {auth,adminOnly} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/profile", auth, getProfile);

// Admin-only routes to manage users
router.post("/add", auth, adminOnly, addUser);
router.get("/all", auth, adminOnly, getAllUsers);
router.put("/update/:id", auth, adminOnly, updateUser);
router.delete("/delete/:id", auth, adminOnly, deleteUser);

module.exports = router;
