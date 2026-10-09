import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

// Auth
export const registerUser = (data) => api.post("/customers/register", data);
export const loginUser = (data) => api.post("/customers/login", data);
export const getMe = () => api.get("/customers/me");
export const logoutUser = () => api.post("/customers/logout");

// Products
export const getProducts = (params) => api.get("/products", { params });
export const getProduct = (id) => api.get(`/products/${id}`);

// Wishlist
export const getWishlist = () => api.get("/wishlist");
export const addToWishlist = (id) => api.post(`/wishlist/${id}`);
export const removeFromWishlist = (id) => api.delete(`/wishlist/${id}`);

// Cart
export const getCart = () => api.get("/cart");
export const addToCartApi = (id) => api.post(`/cart/${id}`);
export const updateCartApi = (id, quantity) => api.patch(`/cart/${id}`, { quantity });
export const removeFromCartApi = (id) => api.delete(`/cart/${id}`);

// Orders
export const createPaymentOrder = (data) => api.post("/orders/create-payment-order", data);
export const verifyPayment = (data) => api.post("/orders/verify-payment", data);
export const getOrders = () => api.get("/orders");
export const getOrder = (id) => api.get(`/orders/${id}`);

export default api;
