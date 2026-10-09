import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrder } from "../services/api";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function OrderDetails({ isSuccess = false }) {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await getOrder(id);
        setOrder(data.order);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load this order.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (loading) return <p className="center">Loading order details...</p>;
  if (error) return <p className="center error">{error}</p>;
  if (!order) return <p className="center">Order not found.</p>;

  if (isSuccess) {
    return (
      <div className="center order-success">
        <h2>✅ Order Placed Successfully</h2>
        <p>
          <strong>Order ID:</strong> {order._id}
        </p>
        <p>
          <strong>Total:</strong> {formatCurrency(order.totalAmount)}
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>Your order has been saved successfully.</p>
        <div className="stacked-actions">
          <Link className="btn" to="/orders">
            View My Orders
          </Link>
          <Link className="btn btn-light" to="/products">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-details-box">
      <h2>Order Details</h2>
      <div className="order-summary-box">
        <p>
          <strong>Order #:</strong> {order._id}
        </p>
        <p>
          <strong>Date:</strong> {formatDate(order.createdAt)}
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Total:</strong> {formatCurrency(order.totalAmount)}
        </p>
      </div>

      <div className="order-items-box">
        {order.items.map((item) => (
          <div key={`${order._id}-${item.product}`} className="order-detail-item">
            <span>
              {item.name} × {item.quantity}
            </span>
            <strong>{formatCurrency(item.price * item.quantity)}</strong>
          </div>
        ))}
      </div>

      <div className="shipping-box">
        <h3>Shipping Address</h3>
        <p>{order.shippingAddress.fullName}</p>
        <p>{order.shippingAddress.addressLine1}</p>
        <p>
          {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
        </p>
        <p>{order.shippingAddress.phone}</p>
      </div>

      <Link className="btn btn-light" to="/orders">Back to My Orders</Link>
    </div>
  );
}
