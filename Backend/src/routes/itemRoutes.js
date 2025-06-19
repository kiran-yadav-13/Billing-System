const express = require("express");
const router = express.Router();
const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  searchItemsByName,
  deleteBatch,
  updateBatch
} = require("../controllers/itemController");

const {auth,adminOnly}= require("../middlewares/authMiddleware");


router.get("/getallItems", auth, getAllItems);
router.get("/getItemById/:id", auth, getItemById);
router.get("/search",auth, searchItemsByName);
router.post("/addItem", auth, adminOnly, createItem);
router.put("/updateItem/:id", auth, adminOnly, updateItem);
router.delete("/deleteItem/:id", auth, adminOnly, deleteItem);
router.delete('/:itemId/deleteBatch/:batchId', auth, adminOnly,deleteBatch);
router.put("/:itemId/batches/:batchId", auth, updateBatch);
module.exports = router;
