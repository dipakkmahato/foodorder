import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart, useDispatchCart } from "../components/ContextReducer";
import { API_BASE_URL } from "../config";

const DELIVERY_CHARGE = 60;

const paymentOptions = [
  {
    value: "COD",
    title: "Cash on Delivery",
    description: "Pay the rider when your food arrives.",
    badge: "COD",
    badgeClass: "payment-badge--cod",
  },
  {
    value: "eSewa",
    title: "eSewa",
    description: "Pay instantly using eSewa wallet.",
    badge: "eS",
    badgeClass: "payment-badge--esewa",
  },
];

const postJson = async (url, body) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    data = {};
  }
  return { response, data, text };
};

const submitEsewaForm = (paymentUrl, formFields) => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = paymentUrl;
  form.style.display = "none";

  Object.entries(formFields || {}).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
};

export default function Checkout() {
  const cart = useCart();
  const dispatch = useDispatchCart();
  const navigate = useNavigate();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price, 0), [cart]);
  const totalQty = useMemo(() => cart.reduce((sum, item) => sum + Number(item.qty || 0), 0), [cart]);
  const totalAmount = subtotal + DELIVERY_CHARGE;

  const buildPayload = () => ({
    userId: localStorage.getItem("userId") || "",
    userEmail: localStorage.getItem("userEmail") || "",
    items: cart.map((item) => ({
      itemId: item.id,
      name: item.name,
      qty: item.qty,
      size: item.size,
      price: item.price,
      img: item.img,
    })),
    deliveryAddress,
    subtotal,
    deliveryCharge: DELIVERY_CHARGE,
    totalAmount,
  });

  const handleCodCheckout = async () => {
    const payload = buildPayload();
    const primary = await postJson(`${API_BASE_URL}/api/orders/checkout/cod`, payload);

    if (primary.response.status === 404) {
      const legacyResponse = await postJson(`${API_BASE_URL}/api/orderData`, {
        email: payload.userEmail,
        order_data: payload.items,
        order_date: new Date().toDateString(),
      });

      if (!legacyResponse.response.ok) {
        throw new Error(legacyResponse.text || "Legacy checkout fallback failed.");
      }

      return {
        success: true,
        order: {
          _id: `legacy-${Date.now()}`,
          userEmail: payload.userEmail,
          items: payload.items,
          subtotal: payload.subtotal,
          deliveryCharge: payload.deliveryCharge,
          totalAmount: payload.totalAmount,
          deliveryAddress: payload.deliveryAddress,
          paymentMethod: "COD",
          paymentStatus: "Pending",
          orderStatus: "Placed",
          createdAt: new Date().toISOString(),
        },
      };
    }

    if (!primary.response.ok) {
      throw new Error(primary.text || primary.data?.error || "Order creation failed.");
    }

    return primary.data;
  };

  const handleEsewaCheckout = async () => {
    const payload = buildPayload();
    const primary = await postJson(`${API_BASE_URL}/api/payments/esewa/initiate`, payload);

    if (primary.response.status === 404) {
      const legacyResponse = await postJson(`${API_BASE_URL}/api/orderData`, {
        email: payload.userEmail,
        order_data: payload.items,
        order_date: new Date().toDateString(),
      });

      if (!legacyResponse.response.ok) {
        throw new Error(legacyResponse.text || "Legacy payment fallback failed.");
      }

      return {
        success: true,
        paymentConfigured: false,
        order: {
          _id: `legacy-${Date.now()}`,
          userEmail: payload.userEmail,
          items: payload.items,
          subtotal: payload.subtotal,
          deliveryCharge: payload.deliveryCharge,
          totalAmount: payload.totalAmount,
          deliveryAddress: payload.deliveryAddress,
          paymentMethod: "eSewa",
          paymentStatus: "Processing",
          orderStatus: "Placed",
          createdAt: new Date().toISOString(),
        },
      };
    }

    if (!primary.response.ok) {
      throw new Error(primary.text || primary.data?.error || "Payment initiation failed.");
    }

    return primary.data;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!localStorage.getItem("authToken")) {
      navigate("/login");
      return;
    }

    if (!deliveryAddress.trim()) {
      setStatus({ type: "danger", text: "Please enter a delivery address." });
      return;
    }

    if (cart.length === 0) {
      setStatus({ type: "danger", text: "Your cart is empty." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", text: "" });

    try {
      if (paymentMethod === "COD") {
        const data = await handleCodCheckout();
        if (!data.success || !data.order) {
          throw new Error("Order creation failed.");
        }
        dispatch({ type: "DROP" });
        setStatus({
          type: "success",
          text: "Order placed successfully. Redirecting to success page...",
        });
        setTimeout(() => {
          navigate(`/order-success/${data.order._id}`, { state: { order: data.order } });
        }, 900);
        return;
      }

      const data = await handleEsewaCheckout();
      if (!data.success || !data.order) {
        throw new Error("Payment initiation failed.");
      }
      dispatch({ type: "DROP" });
      if (data.paymentConfigured && data.paymentUrl) {
        submitEsewaForm(data.paymentUrl, data.formFields);
        return;
      }

      setStatus({
        type: "warning",
        text:
          "eSewa is not configured yet in the backend environment. Your order was saved as processing.",
      });
      setTimeout(() => {
        navigate(`/order-success/${data.order._id}`, {
          state: { order: data.order, paymentNotice: "eSewa not configured yet." },
        });
      }, 1000);
    } catch (error) {
      setStatus({
        type: "danger",
        text: error.message || "Checkout failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-shell">
          <div className="checkout-empty card">
            <h2>Your cart is empty</h2>
            <p>Add items from the menu before checking out.</p>
            <Link to="/" className="btn btn-success">
              Browse Food
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-shell">
        <div className="checkout-hero">
          <span className="checkout-kicker">Secure checkout</span>
          <h1>Review your order and choose payment</h1>
          <p>
            {totalQty} item{totalQty !== 1 ? "s" : ""} in your cart. Delivery charge is applied once per order.
          </p>
        </div>

        {status.text ? (
          <div className={`alert alert-${status.type || "info"} checkout-alert`} role="alert">
            {status.text}
          </div>
        ) : null}

        <div className="checkout-grid">
          <form className="checkout-panel" onSubmit={handleSubmit}>
            <section className="checkout-section">
              <h2>Delivery address</h2>
              <label className="form-label" htmlFor="deliveryAddress">
                Where should we deliver?
              </label>
              <textarea
                id="deliveryAddress"
                className="form-control checkout-textarea"
                rows="4"
                placeholder="Enter your full delivery address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
              />
            </section>

            <section className="checkout-section">
              <h2>Payment method</h2>
              <div className="payment-list">
                {paymentOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`payment-card ${paymentMethod === option.value ? "payment-card--active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={paymentMethod === option.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className={`payment-badge ${option.badgeClass}`}>{option.badge}</span>
                    <span className="payment-copy">
                      <strong>{option.title}</strong>
                      <small>{option.description}</small>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <div className="checkout-actions">
              <button type="submit" className="btn btn-success checkout-submit" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : paymentMethod === "COD" ? "Place Order" : "Pay with eSewa"}
              </button>
              <Link to="/" className="btn btn-outline-light checkout-back">
                Continue Shopping
              </Link>
            </div>
          </form>

          <aside className="checkout-summary">
            <h2>Order summary</h2>
            <div className="summary-list">
              {cart.map((item, index) => (
                <div className="summary-item" key={`${item.id}-${item.size}-${index}`}>
                  <div>
                    <strong>{item.name}</strong>
                    <div className="summary-meta">
                      Qty {item.qty} · {item.size}
                    </div>
                  </div>
                  <span>रु {item.price}</span>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>रु {subtotal}</strong>
              </div>
              <div className="summary-row">
                <span>Delivery charge</span>
                <strong>रु {DELIVERY_CHARGE}</strong>
              </div>
              <div className="summary-row summary-row--grand">
                <span>Grand total</span>
                <strong>रु {totalAmount}</strong>
              </div>
            </div>

            <div className="summary-note">
              Estimated delivery time: 30 to 45 minutes
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
