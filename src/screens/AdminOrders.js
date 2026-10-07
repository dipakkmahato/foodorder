import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../config";

const orderStatuses = ["Placed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

const safeParse = async (response) => {
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  return text ? JSON.parse(text) : {};
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const updateStatus = async (orderId, nextStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await safeParse(response);
      setOrders((current) =>
        current.map((order) => (order._id === orderId ? data.order : order))
      );
      setStatus("Order status updated successfully.");
    } catch (error) {
      setStatus(error.message || "Failed to update order status.");
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      if (!localStorage.getItem("authToken")) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/all`);
        const data = await safeParse(response);
        setOrders(data.orders || []);
      } catch (error) {
        setStatus(error.message || "Unable to load orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [navigate]);

  return (
    <div>
      <Navbar />
      <div className="container py-5">
        <div className="orders-header">
          <h1>Admin Order Management</h1>
          <p>Review all orders and update delivery progress.</p>
        </div>

        {status ? <div className="alert alert-info">{status}</div> : null}
        {loading ? <div className="orders-state">Loading all orders...</div> : null}

        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.userEmail}</td>
                  <td>रु {order.totalAmount}</td>
                  <td>
                    <div>{order.paymentMethod}</div>
                    <small>{order.paymentStatus}</small>
                  </td>
                  <td>{order.orderStatus}</td>
                  <td>
                    <select
                      className="form-select"
                      value={order.orderStatus}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                    >
                      {orderStatuses.map((item) => (
                        <option value={item} key={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
}
