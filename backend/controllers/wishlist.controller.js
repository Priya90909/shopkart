const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const has = (list, id) => list.some((p) => p.equals(id));

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId))
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    if (!(await Product.exists({ _id: productId })))
      return res.status(404).json({ success: false, message: "Product not found" });
    if (has(req.user.wishlist, productId))
      return res.status(409).json({ success: false, message: "Already in wishlist" });

    req.user.wishlist.push(productId);
    await req.user.save();
    res.status(201).json({ success: true, message: "Product added to wishlist" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const user = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price category image stock",
    });
    res.json({ success: true, count: user.wishlist.length, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId))
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    if (!has(req.user.wishlist, productId))
      return res.status(404).json({ success: false, message: "Product not in wishlist" });

    req.user.wishlist = req.user.wishlist.filter((p) => !p.equals(productId));
    await req.user.save();
    res.json({ success: true, message: "Product removed from wishlist" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
