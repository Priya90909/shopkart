const mongoose = require("mongoose");
const Product = require("../models/product.model");

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;
    const product = await Product.create({ name, description, price, category, image, stock });
    res.status(201).json({ success: true, product });
  } catch (err) {
    if (err.name === "ValidationError") return res.status(400).json({ success: false, message: err.message });
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    if (category) filter.category = category;

    let query = Product.find(filter).select("name price category image stock");
    if (sort === "price_asc") query = query.sort({ price: 1 });
    if (sort === "price_desc") query = query.sort({ price: -1 });

    const products = await query;
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
