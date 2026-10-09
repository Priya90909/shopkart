import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/api";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { itemCount, clearCart } = useCart();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      clearCart();
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <span className="brand">ShopKart</span>
      <Link to="/home">Home</Link>
      <Link to="/products">Products</Link>
      <Link to="/wishlist">Wishlist</Link>
      <Link to="/cart">Cart ({itemCount})</Link>
      <Link to="/orders">My Orders</Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}
