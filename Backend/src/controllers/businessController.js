const BusinessProfile = require("../Models/BusinessProfile");

// Create business profile
exports.createBusinessProfile = async (req, res) => {
  try {
    const { businessName, gstNumber, address, contactNumber, logoUrl } = req.body;
    const userId = req.user.id;

    // Check if profile already exists for user
    let existingProfile = await BusinessProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({ success: false, error: "Business profile already exists" });
    }

    const businessProfile = new BusinessProfile({
      businessName,
      gstNumber,
      address,
      contactNumber,
      logoUrl,
      userId,
    });

    await businessProfile.save();

    res.status(201).json({ success: true, businessProfile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get business profile for logged-in user
exports.getBusinessProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const businessProfile = await BusinessProfile.findOne({ userId });

    if (!businessProfile) {
      return res.status(404).json({ success: false, error: "Business profile not found" });
    }

    res.status(200).json({ success: true, businessProfile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};