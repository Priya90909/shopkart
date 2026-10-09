const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    // Lab 04: only product references
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    // Lab 05: product reference + quantity
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Customer", customerSchema);
