const bcrypt = require("bcrypt");
const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;
    if (!fullName || !email || !password || !phone)
      return res.status(400).json({ success: false, message: "All fields are required" });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    if (await Customer.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ success: false, message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const c = await Customer.create({ fullName, email, password: hashed, phone });
    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: { _id: c._id, fullName: c.fullName, email: c.email, phone: c.phone },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const c = email && (await Customer.findOne({ email: email.toLowerCase() }));
    if (!c || !password || !(await bcrypt.compare(password, c.password)))
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    generateToken(res, c._id);
    res.json({
      success: true,
      message: "Login successful",
      customer: { _id: c._id, fullName: c.fullName, email: c.email, phone: c.phone },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.me = (req, res) => {
  const { _id, fullName, email, phone } = req.user;
  res.json({ _id, fullName, email, phone });
};

exports.logout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  res.json({ success: true, message: "Logged out successfully" });
};
