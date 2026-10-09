import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";

export default function Cart() {
  const { cartItems, loading, error, itemCount, subtotal, refreshCart } = useCart();

  if (loading) return <p className="center">Loading your cart...</p>;
  if (error)
    return (
      <div className="center">
        <p>{error}</p>
        <button onClick={refreshCart}>Try Again</button>
      </div>
    );
  if (cartItems.length === 0)
    return (
      <div className="center">
        <h3>Your cart is empty 🛒</h3>
        <p>Looks like you haven't added anything yet.</p>
        <Link className="btn" to="/products">Browse Products</Link>
      </div>
    );

  return (
    <div>
      <h2>My Cart</h2>
      {cartItems.map((item) => <CartItem key={item.product._id} item={item} />)}
      <div className="summary">
        <h3>Order Summary</h3>
        <p>Items: {itemCount}</p>
        <p>Subtotal: ₹{subtotal.toLocaleString("en-IN")}</p>
        <Link className="btn" to="/checkout">Proceed to Checkout</Link>
      </div>
    </div>
  );
}
