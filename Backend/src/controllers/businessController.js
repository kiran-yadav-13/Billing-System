const BusinessProfile = require("../Models/BusinessProfile");
const User = require("../Models/User");


exports.createBusinessProfile = async (req, res) => {
  try {
    const user = req.user;

    // Only owner can create business profile
    if (user.role !== "owner") {
      return res.status(403).json({ success: false, error: "Only owner can create business profiles" });
    }
    if(user.businessId){
      return res.status(403).json({success: false, error: "Business Profile already existed"})
    }

    const { businessName, gstNumber, address, contactNumber, logoUrl } = req.body;

    if (!businessName || !gstNumber || !address || !contactNumber) {
      return res.status(400).json({ success: false, error: "All required fields must be filled" });
    }

    
    const gstExists = await BusinessProfile.findOne({ gstNumber });
    if (gstExists) {
      return res.status(400).json({ success: false, error: "A business with this GST number already exists" });
    }

    // Create business profile
    const profile = await BusinessProfile.create({
      businessName,
      gstNumber,
      address,
      contactNumber,
      logoUrl,
      createdBy: user._id,
    });

    // Update the admin user’s businessId in userschema so that it can be known which business admin belong
    user.businessId = profile._id;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Business profile created successfully",
      profile,
    });

  } catch (error) {
    console.error("Error creating business profile:", error.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

//  Geting business profile for the logged-in user
exports.getBusinessProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user.businessId) {
      return res.status(404).json({ success: false, error: "No business profile assigned to this user" });
    }

    const profile = await BusinessProfile.findById(user.businessId);

    if (!profile) {
      return res.status(404).json({ success: false, error: "Business profile not found" });
    }

    res.status(200).json({
      success: true,
      profile,
    });

  } catch (error) {
    console.error("Error fetching business profile:", error.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};