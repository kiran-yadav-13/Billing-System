const Item = require("../Models/Item");
const dayjs = require("dayjs");
const { createItemSchema, updateItemSchema , batchUpdateSchema} = require("../validators/itemValidators");

// Create or update batch in existing item
exports.createItem = async (req, res) => {
  try {
    const parsed = createItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    }

    const businessId = req.user.businessId;
    const { name, manufacturer, gstRate, hsnCode, unit, description, batches } = parsed.data;
    const batch = batches[0];
    const item = await Item.findOne({ name, manufacturer, businessId });

    if (item) {
      const existingBatch = item.batches.find(b => 
        b.batchNumber === batch.batchNumber &&
        dayjs(b.expiryDate).isSame(dayjs(batch.expiryDate), 'day')
      );

      if (existingBatch) {
        existingBatch.stockQuantity += batch.stockQuantity;
      } else {
        item.batches.push(batch);
      }

      await item.save();
      return res.status(200).json({ success: true, message: "Item batch added/updated", item });
    }

    // Create new item
    const newItem = await Item.create({
      name,
      manufacturer,
      gstRate,
      hsnCode,
      unit,
      description,
      businessId,
      batches: [batch]
    });

    res.status(201).json({ success: true, message: "Item created successfully", item: newItem });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find({ businessId: req.user.businessId });
    res.status(200).json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET item by ID with batch data
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      businessId: req.user.businessId,
    });

    if (!item) return res.status(404).json({ success: false, error: "Item not found" });

    res.status(200).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// SEARCH item by name (case-insensitive, current business)
exports.searchItemsByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ success: false, error: "Search term is required" });

    const regex = new RegExp(name, "i");
    const items = await Item.find({ name: { $regex: regex }, businessId: req.user.businessId });

    res.status(200).json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update item fields (not batches)
exports.updateItem = async (req, res) => {
  try {
    const parsed = updateItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    }

    const item = await Item.findOne({ _id: req.params.id, businessId: req.user.businessId });
    if (!item) return res.status(404).json({ success: false, error: "Item not found" });

    const fieldsToUpdate = parsed.data;
    for (let key in fieldsToUpdate) {
      if (key !== "batch") item[key] = fieldsToUpdate[key];
    }

    await item.save();
    res.status(200).json({ success: true, message: "Item updated", item });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete item (only if no batches)
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, businessId: req.user.businessId });

    if (!item) return res.status(404).json({ success: false, error: "Item not found" });

    if (item.batches.length > 0) {
      return res.status(400).json({ success: false, error: "Delete all batches before deleting item" });
    }

    await item.deleteOne();
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE a specific batch from an item
exports.deleteBatch = async (req, res) => {
  try {
    const { itemId, batchId } = req.params;

    const item = await Item.findOne({ _id: itemId, businessId: req.user.businessId });
    if (!item) return res.status(404).json({ success: false, error: "Item not found" });

    const initialCount = item.batches.length;
    item.batches = item.batches.filter(batch => batch._id.toString() !== batchId);

    if (item.batches.length === initialCount) {
      return res.status(404).json({ success: false, error: "Batch not found" });
    }

    await item.save();
    res.status(200).json({ success: true, message: "Batch deleted", item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE a specific batch
exports.updateBatch = async (req, res) => {
  try {
    const { itemId, batchId } = req.params;

    const parsed = batchUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    }

    const item = await Item.findOne({ _id: itemId, businessId: req.user.businessId });
    if (!item) return res.status(404).json({ success: false, error: "Item not found" });

    const batch = item.batches.id(batchId);
    if (!batch) return res.status(404).json({ success: false, error: "Batch not found" });

    // Update allowed fields only
    Object.assign(batch, parsed.data);

    await item.save();
    res.status(200).json({ success: true, message: "Batch updated", batch });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};