import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const { product, quantity } = item;

  const run = async (fn) => {
    setBusy(true);
    setMsg("");
    try {
      await fn();
    } catch (err) {
      setMsg(err.response?.data?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cart-row">
      <img src={product.image} alt={product.name} />
      <div className="info">
        <strong>{product.name}</strong>
        <div>₹{product.price.toLocaleString("en-IN")}</div>
        {msg && <div className="error">{msg}</div>}
      </div>
      <div className="qty">
        <button disabled={busy || quantity <= 1} onClick={() => run(() => updateQuantity(product._id, quantity - 1))}>-</button>
        <span>{quantity}</span>
        <button disabled={busy || quantity >= product.stock} onClick={() => run(() => updateQuantity(product._id, quantity + 1))}>+</button>
      </div>
      <strong>₹{(product.price * quantity).toLocaleString("en-IN")}</strong>
      <button className="btn-danger" disabled={busy} onClick={() => run(() => removeFromCart(product._id))}>Remove</button>
    </div>
  );
}
