import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiDollarSign, FiCalendar, FiCheckCircle, FiChevronLeft, FiChevronRight, FiSearch, FiFileText } from "react-icons/fi";
import { useToast } from "../../context/ToastContext";
import { API_BASE_URL } from "../../api/api";
import "./Payments.css";

export default function Payments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchOrders = (pageNumber = 0) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/admin/orders?page=${pageNumber}&size=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setOrders(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setError("Failed to stream order intelligence.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const updateOrderStatus = (orderId, newStatus) => {
    const token = localStorage.getItem("token");
    axios
      .put(
        `${API_BASE_URL}/admin/orders/${orderId}/status?status=${newStatus}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: res.data.status } : o)));
        showToast("Order status updated", "success");
      })
      .catch((err) => {
        console.error("Error updating status:", err);
        showToast("Status update failed logic check.", "error");
      });
  };

  return (
    <div className="container mt-5 payments-page">
      <div className="premium-card p-4 p-md-5">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="fw-800 mb-1">Order Stream</h2>
            <p className="text-muted small mb-0">Real-time oversight of transactions and logistics.</p>
          </div>
          <div className="text-secondary small fw-600 bg-light px-3 py-2 rounded-pill">
            Volume: <span className="text-dark">{orders.length}</span>
          </div>
        </div>

        {error && <div className="alert alert-danger rounded-4">{error}</div>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3"></div>
            <p className="text-muted fw-600">Syncing transaction ledger...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Customer</th>
                  <th>Contact Info</th>
                  <th>Kitchen</th>
                  <th>Total Amount</th>
                  <th>Lifecycle Status</th>
                  <th>Timestamp</th>
                  {/* <th className="text-end">Command</th> */}
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? orders.map((order, index) => (
                  <tr key={order.id} className="reveal-item" style={{ animationDelay: `${index * 0.05}s` }}>
                    <td className="fw-bold text-secondary">
                      <span className="id-badge">#{order.id}</span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-mini bg-light-soft"><i className="fas fa-shopping-bag text-primary"></i></div>
                        <div className="fw-800 text-dark">{order.userName || "Guest"}</div>
                      </div>
                    </td>
                    <td>
                      <div className="text-secondary extra-small fw-600 mb-1"><i className="far fa-envelope me-2 opacity-50"></i>{order.userEmail}</div>
                      <div className="text-secondary extra-small fw-600"><i className="fas fa-mobile-screen-button me-2 opacity-50"></i>{order.userPhone}</div>
                    </td>
                    <td className="fw-800 text-dark small">{order.restaurantName}</td>
                    <td>
                      <div className="price-tag-admin">₹{order.totalAmount}</div>
                    </td>
                    <td>
                      <span className={`status-pill ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-muted extra-small fw-700">{new Date(order.createdAt).toLocaleDateString()}</td>
                    {/* <td className="text-end">
                      <select
                        className="status-select-admin"
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      >
                        <option value="PLACED">Placed</option>
                        <option value="PREPARING">Preparing</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td> */}
                  </tr>
                )) : (
                  <tr><td colSpan="8" className="text-center py-5 text-muted">No transactions recorded in this period.</td></tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            {totalPages >= 1 && (
              <div className="d-flex justify-content-center mt-5">
                <nav>
                  <ul className="pagination gap-1">
                    <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
                      <button className="page-link shadow-none border-0 rounded-3" onClick={() => setCurrentPage(currentPage - 1)}>
                        <i className="fas fa-chevron-left"></i>
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
                        <button className="page-link shadow-none border-0 rounded-3" onClick={() => setCurrentPage(i)}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`}>
                      <button className="page-link shadow-none border-0 rounded-3" onClick={() => setCurrentPage(currentPage + 1)}>
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
