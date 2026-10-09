import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../services/api";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await getOrders();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load your orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p className="center">Loading your orders...</p>;
  if (error) return <p className="center error">{error}</p>;

  if (!orders.length) {
    return (
      <div className="center">
        <h3>You have not placed any orders yet.</h3>
        <Link className="btn" to="/products">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>My Orders</h2>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-head">
              <strong>Order #{order._id.slice(-6)}</strong>
              <span>{formatDate(order.createdAt)}</span>
            </div>

            <div className="order-items">
              {order.items.map((item) => (
                <div key={`${order._id}-${item.product}`} className="order-item-line">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="order-meta">
              <span>Total: {formatCurrency(order.totalAmount)}</span>
              <span>Status: {order.status}</span>
            </div>

            <Link className="btn btn-light" to={`/orders/${order._id}`}>
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
