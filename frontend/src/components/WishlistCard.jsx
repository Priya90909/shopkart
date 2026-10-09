import { Link } from "react-router-dom";

export default function WishlistCard({ product, onRemove, removing }) {
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
          <button className="btn-danger" onClick={() => onRemove(product._id)} disabled={removing}>
            {removing ? "Removing..." : "Remove ♥"}
          </button>
        </div>
      </div>
    </div>
  );
}
