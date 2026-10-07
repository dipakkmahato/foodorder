import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config";

const normalizeLegacyOrders = (legacyOrder) => {
  if (!legacyOrder?.order_data) {
    return [];
  }

  return legacyOrder.order_data.map((group, index) => {
    const [dateEntry, ...items] = group;
    const createdAt = dateEntry?.Order_date || new Date().toISOString();
    const normalizedItems = items.map((item) => ({
      itemId: item.itemId || item.id || `${index}-${item.name}`,
      name: item.name,
      qty: Number(item.qty) || 1,
      size: item.size || "Regular",
      price: Number(item.price) || 0,
      img: item.img || "",
    }));

    return {
      _id: `legacy-${index}-${createdAt}`,
      displayTitle: `Legacy order ${index + 1}`,
      createdAt,
      totalAmount: normalizedItems.reduce((sum, item) => sum + item.price, 0),
      paymentMethod: "COD",
      paymentStatus: "Pending",
      orderStatus: "Placed",
      items: normalizedItems,
    };
  });
};

const buildOrderSummary = (order) => {
  const items = Array.isArray(order.items) ? order.items : [];
  const itemCount =
    typeof order.itemCount === "number"
      ? order.itemCount
      : items.reduce((sum, item) => sum + (Number(item.qty) || 1), 0);
  const subtotal =
    typeof order.subtotal === "number"
      ? order.subtotal
      : items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const deliveryCharge = typeof order.deliveryCharge === "number" ? order.deliveryCharge : 0;
  const totalAmount =
    typeof order.totalAmount === "number" ? order.totalAmount : subtotal + deliveryCharge;

  return {
    itemCount,
    subtotal,
    deliveryCharge,
    totalAmount,
  };
};

export default function MyOrder() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyOrder = async () => {
      if (!localStorage.getItem("authToken")) {
        navigate("/login");
        return;
      }

      const userId = localStorage.getItem("userId");
      const userEmail = localStorage.getItem("userEmail");

      try {
        const url = userId
          ? `${API_BASE_URL}/api/orders/mine/${userId}`
          : `${API_BASE_URL}/api/orders/mine?email=${encodeURIComponent(userEmail || "")}`;

        const response = await fetch(url);
        let normalizedOrders = [];

        if (response.status === 404) {
          const legacyResponse = await fetch(`${API_BASE_URL}/api/myOrderData`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: userEmail,
            }),
          });

          const legacyText = await legacyResponse.text();
          if (!legacyResponse.ok) {
            throw new Error(legacyText || "Unable to load your orders.");
          }

          const legacyData = legacyText ? JSON.parse(legacyText) : {};
          normalizedOrders = normalizeLegacyOrders(legacyData.orderData);
        } else {
          const text = await response.text();
          if (!response.ok) {
            throw new Error(text || `Request failed with status ${response.status}`);
          }

          const data = text ? JSON.parse(text) : {};
          normalizedOrders = (data.orders || []).map((order, index) => ({
            ...order,
            displayTitle: `Order ${index + 1}`,
          }));
        }

        setOrders(normalizedOrders);
        setMessage(normalizedOrders.length ? "" : "No previous orders found.");
      } catch (error) {
        setMessage(error.message || "Unable to load your orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrder();
  }, [navigate]);

  return (
    <div className="order-page">
      <Navbar />
      <div className="order-shell">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Track previous orders, payment method, and delivery status.</p>
        </div>

        {loading ? <div className="orders-state">Loading your orders...</div> : null}
        {message ? <div className="alert alert-info">{message}</div> : null}

        <div className="orders-grid">
          {orders.map((order) => (
            <div className="order-history-card" key={order._id}>
              {(() => {
                const summary = buildOrderSummary(order);
                const items = Array.isArray(order.items) ? order.items : [];
                const thumbnails = items.filter((item) => item.img).slice(0, 4);

                return (
                  <>
              <div className="order-history-top">
                <div>
                  <span>Order</span>
                  <strong>{order.displayTitle || `Order ${String(order._id).slice(-6)}`}</strong>
                </div>
                <span
                  className={`status-pill status-pill--${String(order.orderStatus || "")
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {order.orderStatus}
                </span>
              </div>

              <div className="order-history-meta">
                <div>
                  <span>Date</span>
                  <strong>{new Date(order.createdAt).toLocaleString()}</strong>
                </div>
                <div>
                  <span>Amount</span>
                  <strong>रु {order.totalAmount}</strong>
                </div>
                <div>
                  <span>Payment Method</span>
                  <strong>{order.paymentMethod}</strong>
                </div>
                <div>
                  <span>Payment Status</span>
                  <strong>{order.paymentStatus}</strong>
                </div>
              </div>

              {thumbnails.length > 0 ? (
                <div className="order-thumb-strip" aria-label="Ordered item previews">
                  {thumbnails.map((item, index) => (
                    <div className="order-thumb" key={`${item.itemId || item.name}-${index}`}>
                      <img src={item.img} alt={item.name} />
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="order-history-items">
                {(order.items || []).slice(0, 3).map((item, index) => (
                  <div className="history-item" key={`${item.itemId}-${index}`}>
                    <span>{item.name}</span>
                    <small>
                      Qty {item.qty} · {item.size}
                    </small>
                  </div>
                ))}
                {(order.items || []).length > 3 ? (
                  <div className="history-item history-item--more">
                    +{(order.items || []).length - 3} more item{(order.items || []).length - 3 > 1 ? "s" : ""}
                  </div>
                ) : null}
              </div>
              
              <div className="order-summary-footer">
                <div className="order-summary-pill">
                  <span>Items</span>
                  <strong>{summary.itemCount}</strong>
                </div>
                <div className="order-summary-pill">
                  <span>Subtotal</span>
                  <strong>रु {summary.subtotal}</strong>
                </div>
                <div className="order-summary-pill">
                  <span>Delivery</span>
                  <strong>रु {summary.deliveryCharge}</strong>
                </div>
                <div className="order-summary-pill order-summary-pill--total">
                  <span>Total</span>
                  <strong>रु {summary.totalAmount}</strong>
                </div>
              </div>
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
