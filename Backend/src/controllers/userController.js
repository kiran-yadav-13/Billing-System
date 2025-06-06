const User = require("../Models/User");

exports.register = async (req, res) => {
  try {
    const { name, email, password, gstin, address, contactNumber } = req.body;
    //console.log("Incoming body data:", req.body);

    const user = await User.create({ name, email, password, gstin, address, contactNumber });

    const token = user.generateToken();

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({ success: true, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = user.generateToken();

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({ success: true, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token").json({ success: true, message: "Logged out successfully" });
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
