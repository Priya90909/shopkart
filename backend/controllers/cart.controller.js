const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// Returns the user's cart with product details (skips deleted products)
const loadCart = async (userId) => {
  const user = await Customer.findById(userId).populate("cart.product", "name price category image stock");
  return user.cart.filter((item) => item.product);
};

const badId = (id) => !mongoose.isValidObjectId(id);

exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    if (badId(productId)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const item = req.user.cart.find((i) => i.product.equals(productId));
    const newQty = (item ? item.quantity : 0) + 1;
    if (newQty > product.stock)
      return res.status(400).json({ success: false, message: "Not enough stock" });

    if (item) item.quantity = newQty;
    else req.user.cart.push({ product: productId, quantity: 1 });
    await req.user.save();

    res.json({ success: true, message: "Cart updated", cart: await loadCart(req.user._id) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    res.json({ success: true, cart: await loadCart(req.user._id) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    if (badId(productId)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    if (!Number.isInteger(quantity) || quantity < 1)
      return res.status(400).json({ success: false, message: "Quantity must be a number, at least 1" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const item = req.user.cart.find((i) => i.product.equals(productId));
    if (!item) return res.status(404).json({ success: false, message: "Product not in cart" });
    if (quantity > product.stock)
      return res.status(400).json({ success: false, message: "Quantity exceeds stock" });

    item.quantity = quantity;
    await req.user.save();
    res.json({ success: true, message: "Cart updated", cart: await loadCart(req.user._id) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    if (badId(productId)) return res.status(400).json({ success: false, message: "Invalid product ID" });

    req.user.cart = req.user.cart.filter((i) => !i.product.equals(productId));
    await req.user.save();
    res.json({ success: true, message: "Item removed", cart: await loadCart(req.user._id) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
