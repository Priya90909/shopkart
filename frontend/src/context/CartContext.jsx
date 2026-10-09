import { createContext, useContext, useEffect, useState } from "react";
import { getCart, addToCartApi, updateCartApi, removeFromCartApi } from "../services/api";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshCart = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getCart();
      setCartItems(data.cart);
    } catch (err) {
      // 401 just means "not logged in", so the cart is simply empty
      if (err.response?.status === 401) setCartItems([]);
      else setError("Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  // Each mutation calls the backend, then replaces the shared state with its response.
  // Errors are thrown so the calling component can show a message.
  const mutate = async (request) => {
    const { data } = await request();
    setCartItems(data.cart);
  };

  const addToCart = (id) => mutate(() => addToCartApi(id));
  const updateQuantity = (id, qty) => mutate(() => updateCartApi(id, qty));
  const removeFromCart = (id) => mutate(() => removeFromCartApi(id));
  const clearCart = () => setCartItems([]);

  // Derived values: never stored, always calculated
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, loading, error, itemCount, subtotal, refreshCart, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
