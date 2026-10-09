const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: "Not authenticated" });

    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Customer.findById(id).select("-password");
    if (!user) return res.status(401).json({ success: false, message: "Not authenticated" });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Not authenticated" });
  }
};

module.exports = protect;
