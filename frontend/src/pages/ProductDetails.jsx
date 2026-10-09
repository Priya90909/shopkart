import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProduct } from "../services/api";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    getProduct(id)
      .then((res) => setProduct(res.data.product))
      .catch((err) => setError(err.response?.status === 404 ? "Product not found." : "Something went wrong while loading the product."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    setAdding(true);
    setMsg("");
    try {
      await addToCart(product._id);
      setMsg("Added to cart ✓");
    } catch (err) {
      setMsg(err.response?.data?.message || "Unable to add to cart.");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <p className="center">Loading product...</p>;
  if (error) return <p className="center error">{error}</p>;

  return (
    <div className="details">
      <img src={product.image} alt={product.name} />
      <div>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <h3>₹{product.price.toLocaleString("en-IN")}</h3>
        <p className="muted">Category: {product.category}</p>
        <p className="muted">{product.stock > 0 ? `${product.stock} units left` : "Out of stock"}</p>
        <button onClick={handleAdd} disabled={adding || product.stock === 0}>
          {adding ? "Adding..." : "Add to Cart"}
        </button>
        {msg && <p>{msg}</p>}
      </div>
    </div>
  );
}
