import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWishlist, removeFromWishlist } from "../services/api";
import WishlistCard from "../components/WishlistCard";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const load = () => {
    setLoading(true);
    setError(false);
    getWishlist()
      .then((res) => setItems(res.data.wishlist))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRemove = async (id) => {
    setRemovingId(id);
    try {
      await removeFromWishlist(id);
      setItems((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Unable to remove product. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) return <p className="center">Loading your wishlist...</p>;
  if (error)
    return (
      <div className="center">
        <h3>Something went wrong.</h3>
        <p>We couldn't load your wishlist.</p>
        <button onClick={load}>Try Again</button>
      </div>
    );
  if (items.length === 0)
    return (
      <div className="center">
        <div style={{ fontSize: "3rem" }}>❤️</div>
        <h3>Your wishlist is empty</h3>
        <p>Save products you love and find them here later.</p>
        <Link className="btn" to="/products">Browse Products</Link>
      </div>
    );

  return (
    <div>
      <h2>My Wishlist</h2>
      <p className="muted">{items.length} products saved</p>
      <div className="grid">
        {items.map((p) => (
          <WishlistCard key={p._id} product={p} onRemove={handleRemove} removing={removingId === p._id} />
        ))}
      </div>
    </div>
  );
}
