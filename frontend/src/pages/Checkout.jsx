import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createPaymentOrder, verifyPayment } from "../services/api";

const initialForm = {
  fullName: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Checkout() {
  const { cartItems, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (!cartItems.length) {
      navigate("/cart", { replace: true });
    }
  }, [cartItems, navigate]);

  const handleInputChange = (field, value) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const trimmed = Object.fromEntries(
      Object.entries(shippingAddress).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])
    );

    for (const [field, value] of Object.entries(trimmed)) {
      if (!value) {
        nextErrors[field] = "This field is required";
      }
    }

    if (trimmed.phone && !/^[+]?\d{10,15}$/.test(trimmed.phone)) {
      nextErrors.phone = "Phone must contain a valid number";
    }

    if (trimmed.pincode && !/^\d{6}$/.test(trimmed.pincode)) {
      nextErrors.pincode = "Pincode must contain 6 digits";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setServerError("");

    if (!validateForm()) {
      return;
    }

    setPlacingOrder(true);

    try {
      const { data } = await createPaymentOrder({ shippingAddress });
      const scriptReady = await loadRazorpayScript();

      if (!scriptReady) {
        throw new Error("Razorpay checkout script could not be loaded");
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart Order",
        order_id: data.razorpayOrderId,
        handler: async function (response) {
          try {
            const verification = await verifyPayment({
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart();
            navigate(`/order-success/${verification.data.order._id}`);
          } catch (error) {
            setServerError(error.response?.data?.message || "Payment verification failed.");
          } finally {
            setPlacingOrder(false);
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: () => {
            setPlacingOrder(false);
            setServerError("Payment cancelled. Your cart is still intact.");
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response) {
        setServerError(response.error?.description || "Payment failed. Please try again.");
        setPlacingOrder(false);
      });
      paymentObject.open();
    } catch (error) {
      setServerError(error.response?.data?.message || error.message || "Unable to process your order.");
      setPlacingOrder(false);
    }
  };

  if (!cartItems.length) {
    return <p className="center">Loading checkout...</p>;
  }

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      <form className="checkout-grid" onSubmit={handlePlaceOrder}>
        <div className="checkout-panel">
          <h3>Shipping Details</h3>

          <div className="field-group">
            <label>Full Name</label>
            <input
              value={shippingAddress.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
            />
            {errors.fullName && <span className="error">{errors.fullName}</span>}
          </div>

          <div className="field-group">
            <label>Phone</label>
            <input
              value={shippingAddress.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          <div className="field-group">
            <label>Address</label>
            <input
              value={shippingAddress.addressLine1}
              onChange={(e) => handleInputChange("addressLine1", e.target.value)}
            />
            {errors.addressLine1 && <span className="error">{errors.addressLine1}</span>}
          </div>

          <div className="form-row">
            <div className="field-group">
              <label>City</label>
              <input value={shippingAddress.city} onChange={(e) => handleInputChange("city", e.target.value)} />
              {errors.city && <span className="error">{errors.city}</span>}
            </div>

            <div className="field-group">
              <label>State</label>
              <input value={shippingAddress.state} onChange={(e) => handleInputChange("state", e.target.value)} />
              {errors.state && <span className="error">{errors.state}</span>}
            </div>
          </div>

          <div className="field-group">
            <label>Pincode</label>
            <input value={shippingAddress.pincode} onChange={(e) => handleInputChange("pincode", e.target.value)} />
            {errors.pincode && <span className="error">{errors.pincode}</span>}
          </div>
        </div>

        <aside className="checkout-panel summary-panel">
          <h3>Order Summary</h3>

          {cartItems.map((item) => (
            <div key={item.product._id} className="checkout-item-row">
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <strong>{formatCurrency(item.product.price * item.quantity)}</strong>
            </div>
          ))}

          <div className="total-row">
            <span>Total</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>

          {serverError && <p className="error server-error">{serverError}</p>}

          <button type="submit" disabled={placingOrder}>
            {placingOrder ? "Processing..." : "Place Order"}
          </button>
          <Link className="btn btn-light" to="/cart">Back to Cart</Link>
        </aside>
      </form>
    </div>
  );
}
