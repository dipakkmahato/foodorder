import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../config";

const safeParse = async (response) => {
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  return text ? JSON.parse(text) : {};
};

export default function OrderSuccess() {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [message, setMessage] = useState(location.state?.paymentNotice || "");
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId || order) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
        const data = await safeParse(response);
        setOrder(data.order);
      } catch (error) {
        setMessage(error.message || "Unable to load the order.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, order]);

  return (
    <div className="order-page">
      <Navbar />
      <div className="order-shell">
        <div className="order-card">
          <span className="order-kicker">Order confirmed</span>
          <h1>Thank you for your order</h1>
          <p>
            {message || "Your order has been received and is being prepared."}
          </p>

          {loading ? (
            <div className="order-loading">Loading order details...</div>
          ) : null}

          {order ? (
            <>
              <div className="order-meta-grid">
                <div>
                  <span>Order ID</span>
                  <strong>{order._id}</strong>
                </div>
                <div>
                  <span>Payment Method</span>
                  <strong>{order.paymentMethod}</strong>
                </div>
                <div>
                  <span>Payment Status</span>
                  <strong>{order.paymentStatus}</strong>
                </div>
                <div>
                  <span>Total Amount</span>
                  <strong>रु {order.totalAmount}</strong>
                </div>
                <div>
                  <span>Order Status</span>
                  <strong>{order.orderStatus}</strong>
                </div>
                <div>
                  <span>Estimated Delivery</span>
                  <strong>30 to 45 minutes</strong>
                </div>
              </div>

              <div className="order-items">
                <h2>Ordered items</h2>
                {order.items.map((item, index) => (
                  <div className="order-item" key={`${item.itemId}-${index}`}>
                    <div>
                      <strong>{item.name}</strong>
                      <div className="order-item-meta">
                        Qty {item.qty} · {item.size}
                      </div>
                    </div>
                    <span>रु {item.price}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          <div className="order-actions">
            <Link to="/" className="btn btn-success">
              Back to Home
            </Link>
            <Link to="/myOrder" className="btn btn-outline-light">
              View My Orders
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
