const BusinessProfile = require("../Models/BusinessProfile");
const User = require("../Models/User");
const {businessProfileSchema,updateBusinessProfile} = require("../validators/businessValidators");


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
    //const { businessName, gstNumber, address, contactNumber, logoUrl } = req.body;
    const { businessName, gstNumber, address, contactNumber, logoUrl } = parsed.data;

    
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



// @desc    Update Business Profile
// @route   PUT /api/business/:id
// @access  Admin only
exports.updateBusinessProfile = async (req, res) => {
  try {
   
    const parsed = updateBusinessProfile.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const businessId = req.params.id;

    const existingProfile = await BusinessProfile.findById(businessId);
    if (!existingProfile) {
      return res.status(404).json({ success: false, error: "Business profile not found" });
    }

    // logged-in admin is updating their own business profile
    if (existingProfile._id.toString() !== req.user.businessId.toString()) {
      return res.status(403).json({ success: false, error: "Unauthorized to update this business" });
    }

    // Update only provided fields
    const updatedData = parsed.data;

    Object.assign(existingProfile, updatedData);

    await existingProfile.save();

    res.json({
      success: true,
      message: "Business profile updated successfully",
      data: existingProfile,
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
