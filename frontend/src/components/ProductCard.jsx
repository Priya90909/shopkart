import { useState } from "react";
import { Link } from "react-router-dom";
import { addToWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [wishState, setWishState] = useState("idle"); // idle | saving | saved | error
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState("");

  const handleWishlist = async () => {
    setWishState("saving");
    try {
      await addToWishlist(product._id);
      setWishState("saved");
    } catch (err) {
      // 409 means it was already saved, which is fine
      setWishState(err.response?.status === 409 ? "saved" : "error");
    }
  };

  const handleAddToCart = async () => {
    setAdding(true);
    setMsg("");
    try {
      await addToCart(product._id);
    } catch (err) {
      setMsg(err.response?.data?.message || "Unable to add to cart.");
    } finally {
      setAdding(false);
    }
  };

  const wishLabel = {
    idle: "♡ Add to Wishlist",
    saving: "⏳ Saving...",
    saved: "♥ Added to Wishlist",
    error: "♡ Add to Wishlist",
  }[wishState];

  return (
    <div className="card">
      <img src={product.image} alt={product.name} />
      <div className="body">
        <strong>{product.name}</strong>
        <span className="muted">{product.category}</span>
        <span>₹{product.price.toLocaleString("en-IN")}</span>
        <span className="muted">{product.stock > 0 ? `${product.stock} units left` : "Out of stock"}</span>
        <div className="actions">
          <Link className="btn" to={`/products/${product._id}`}>View Details</Link>
          <button className="btn-light" style={{ color: "#222" }} onClick={handleWishlist} disabled={wishState === "saving" || wishState === "saved"}>
            {wishLabel}
          </button>
          <button onClick={handleAddToCart} disabled={adding || product.stock === 0}>
            {adding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
        {wishState === "error" && <span className="error">Unable to save product. Please try again.</span>}
        {msg && <span className="error">{msg}</span>}
      </div>
    </div>
  );
}
