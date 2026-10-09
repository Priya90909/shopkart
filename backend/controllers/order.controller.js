const crypto = require("crypto");
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const razorpay = require("../config/razorpay");

const isValidPhone = (phone = "") => /^[+]?\d{10,15}$/.test(phone.trim());
const isValidPincode = (value = "") => /^\d{6}$/.test(String(value).trim());

const validateShippingAddress = (shippingAddress = {}) => {
  const fields = [
    ["fullName", shippingAddress.fullName],
    ["phone", shippingAddress.phone],
    ["addressLine1", shippingAddress.addressLine1],
    ["city", shippingAddress.city],
    ["state", shippingAddress.state],
    ["pincode", shippingAddress.pincode],
  ];

  for (const [field, value] of fields) {
    if (typeof value !== "string" || !value.trim()) {
      return `${field} is required`;
    }
  }

  if (!isValidPhone(shippingAddress.phone)) {
    return "Phone must contain a valid number";
  }

  if (!isValidPincode(shippingAddress.pincode)) {
    return "Pincode must contain 6 digits";
  }

  return null;
};

exports.createPaymentOrder = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate("cart.product", "name price stock image");
    if (!customer) return res.status(404).json({ success: false, message: "User not found" });

    const shippingError = validateShippingAddress(req.body.shippingAddress);
    if (shippingError) {
      return res.status(400).json({ success: false, message: shippingError });
    }

    const cartItems = customer.cart.filter((item) => item.product);
    if (!cartItems.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const snapshotItems = [];
    let totalAmount = 0;

    for (const cartItem of cartItems) {
      const product = cartItem.product;
      if (!product) {
        return res.status(400).json({ success: false, message: "One or more products are unavailable" });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });
      }

      const unitPrice = Number(product.price);
      snapshotItems.push({
        product: product._id,
        name: product.name,
        price: unitPrice,
        quantity: Number(cartItem.quantity),
        image: product.image,
      });
      totalAmount += unitPrice * Number(cartItem.quantity);
    }

    const order = await Order.create({
      user: req.user._id,
      items: snapshotItems,
      shippingAddress: req.body.shippingAddress,
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: "Razorpay credentials are not configured" });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: order._id.toString(),
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    if (!mongoose.isValidObjectId(shopKartOrderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (!order.user.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "You are not allowed to access this order" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId || razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    const customer = await Customer.findById(req.user._id);
    customer.cart = [];
    await customer.save();

    res.json({ success: true, message: "Payment verified and order placed", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (!order.user.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "You are not allowed to access this order" });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
