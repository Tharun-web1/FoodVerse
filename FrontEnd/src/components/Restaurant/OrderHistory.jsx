import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "../RestaurantCss/OrderHistory.css";
import { API_BASE_URL } from "../../api/api";

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [filter, setFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const token = localStorage.getItem("restaurant_token");
    const restaurantId = localStorage.getItem("restaurantId");

    useEffect(() => {
        const initializeAndFetch = async () => {
            let resId = restaurantId;

            // Robust ID check
            const isValidId = (id) => id && id !== "undefined" && id !== "null";

            if (!isValidId(resId)) {
                try {
                    const profileRes = await axios.get(`${API_BASE_URL}/restaurants/profile`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (profileRes.data && isValidId(profileRes.data.id)) {
                        resId = profileRes.data.id;
                        localStorage.setItem("restaurantId", resId);
                    }
                } catch (err) {
                    console.error("Error fetching profile for ID:", err);
                }
            }

            if (isValidId(resId)) {
                setIsLoading(true);
                try {
                    const res = await axios.get(`${API_BASE_URL}/orders/restaurant/${resId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setOrders(res.data);
                    applyFilter(res.data, filter);
                } catch (err) {
                    console.error("Error fetching orders:", err);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        initializeAndFetch();
    }, [token]);

    const applyFilter = (allOrders, selectedFilter) => {
        const now = new Date();
        const filtered = allOrders.filter((order) => {
            const orderDateStr = order.orderTime || order.createdAt || order.orderDate || order.date;
            if (!orderDateStr) return false;

            const orderDate = new Date(orderDateStr);
            const diffTime = Math.abs(now - orderDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (selectedFilter === "daily") {
                return (
                    orderDate.getDate() === now.getDate() &&
                    orderDate.getMonth() === now.getMonth() &&
                    orderDate.getFullYear() === now.getFullYear()
                );
            } else if (selectedFilter === "weekly") {
                return diffDays <= 7;
            } else if (selectedFilter === "monthly") {
                return diffDays <= 30;
            }
            return true;
        });

        const sorted = [...filtered].sort((a, b) => {
            const dateA = new Date(a.orderTime || a.createdAt || a.orderDate || a.date);
            const dateB = new Date(b.orderTime || b.createdAt || b.orderDate || b.date);
            return dateB - dateA;
        });

        setFilteredOrders(sorted);
    };

    const handleFilterChange = (e) => {
        const selectedValue = e.target.value;
        setFilter(selectedValue);
        applyFilter(orders, selectedValue);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <>
            <Navbar />
            <div className="order-history-page-wrapper">
                <div className="container mt-5 mb-5">
                    <div className="order-history-container shadow-sm rounded border bg-white">
                        <div className="order-history-header p-4 d-flex justify-content-between align-items-center border-bottom">
                            <h2 className="fw-bold mb-0">📦 Order History</h2>
                            <div className="filter-controls d-flex align-items-center">
                                <label htmlFor="order-filter" className="me-2 fw-bold text-muted">View:</label>
                                <select
                                    id="order-filter"
                                    className="form-select form-select-sm"
                                    value={filter}
                                    onChange={handleFilterChange}
                                    style={{ width: 'auto' }}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="all">All Time</option>
                                </select>
                            </div>
                        </div>

                        <div className="p-4">
                            {isLoading ? (
                                <div className="loading-container text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2">Fetching your history...</p>
                                </div>
                            ) : filteredOrders.length === 0 ? (
                                <div className="text-center py-5 border rounded bg-light">
                                    <i className="fas fa-history mb-3 text-muted" style={{ fontSize: '2rem' }}></i>
                                    <p className="text-muted mb-0">No orders found for this period.</p>
                                </div>
                            ) : (
                                <div className="orders-list">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>Order ID</th>
                                                    <th>Date</th>
                                                    <th>Customer</th>
                                                    <th>Items</th>
                                                    <th className="text-end">Total</th>
                                                    <th className="text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredOrders.map((order) => (
                                                    <tr key={order.id}>
                                                        <td><span className="fw-bold text-primary">#{order.id}</span></td>
                                                        <td><small className="text-muted">{formatDate(order.orderTime || order.createdAt || order.orderDate || order.date)}</small></td>
                                                        <td><span className="fw-bold">{order.customerName}</span></td>
                                                        <td>
                                                            <small className="text-muted">
                                                                {order.items?.map(item => `${item.itemName} (x${item.quantity})`).join(", ")}
                                                            </small>
                                                        </td>
                                                        <td className="text-end fw-bold">₹{order.totalAmount}</td>
                                                        <td className="text-center">
                                                            <span className={`badge rounded-pill ${order.status === "PENDING" ? "bg-secondary" :
                                                                order.status === "ACCEPTED" ? "bg-info" :
                                                                    order.status === "PREPARING" ? "bg-warning text-dark" :
                                                                        order.status === "OUT_FOR_DELIVERY" ? "bg-primary" :
                                                                            order.status === "DELIVERED" ? "bg-success" : "bg-danger"
                                                                }`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}
