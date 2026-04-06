import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import OrderTable from './OrderTable';
import { API_BASE_URL } from '../../api/api';

const TotalOrders = () => {
    const [orders, setOrders] = useState([]);
    const [activeStatus, setActiveStatus] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("restaurant_token");

    const fetchOrders = async () => {
        const restaurantId = localStorage.getItem("restaurantId");
        if (!restaurantId) return;

        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/orders/restaurant/${restaurantId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                setOrders(response.data);
            }
        } catch (error) {
            console.error("Error fetching total orders:", error);
            setError("Failed to fetch orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Function to update order status (passed to OrderTable)
    const updateStatus = async (orderId, status, prepTime = null) => {
        try {
            let url = `${API_BASE_URL}/orders/${orderId}/status?status=${status}`;
            if (prepTime) url += `&prepTime=${prepTime}`;

            await axios.put(
                url,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchOrders(); // Refresh after update
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status");
        }
    };

    const statusCategories = [
        { label: "All", value: "ALL" },
        { label: "New", value: "NEW" }, // PLACED, PAID
        { label: "Accepted", value: "ACCEPTED" },
        { label: "Preparing", value: "PREPARING" },
        { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
        { label: "Completed", value: "DELIVERED" },
        { label: "Cancelled", value: "CANCELLED" }
    ];

    const filteredOrders = orders.filter(order => {
        if (activeStatus === "ALL") return true;
        if (activeStatus === "NEW") return ["PLACED", "PAID"].includes(order.status);
        if (activeStatus === "CANCELLED") return ["CANCELLED", "CANCELED", "REJECTED"].includes(order.status);
        return order.status === activeStatus;
    });

    return (
        <>
            <Navbar />
            <div className="container mt-5 mb-4 p-4 bg-white shadow-sm rounded" style={{ "minHeight": "56vh" }}>
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <h3 className="fw-bold mb-0">Total Orders</h3>
                    <button className="btn btn-outline-primary px-4" onClick={fetchOrders} disabled={loading}>
                        {loading ? "Refreshing..." : "Refresh Data"}
                    </button>
                </div>

                {/* Status Filter Tabs */}
                <div className="mb-4">
                    <ul className="nav nav-pills gap-2 p-1 bg-light rounded border shadow-sm" style={{ width: 'fit-content' }}>
                        {statusCategories.map((cat) => (
                            <li className="nav-item" key={cat.value}>
                                <button
                                    className={`nav-link px-4 py-2 border-0 fw-semibold rounded ${activeStatus === cat.value ? "active shadow-sm" : "text-muted"}`}
                                    onClick={() => setActiveStatus(cat.value)}
                                >
                                    {cat.label}
                                    {cat.value !== "ALL" && (
                                        <span className="ms-2 badge rounded-pill bg-opacity-25 bg-light text-dark small">
                                            {orders.filter(o => {
                                                if (cat.value === "NEW") return ["PLACED", "PAID"].includes(o.status);
                                                if (cat.value === "CANCELLED") return ["CANCELLED", "CANCELED", "REJECTED"].includes(o.status);
                                                return o.status === cat.value;
                                            }).length}
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {loading ? (
                    <div className="text-center mt-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Fetching all orders...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                ) : (
                    <OrderTable orders={filteredOrders} updateStatus={updateStatus} showActions={true} />
                )}
            </div>
        </>
    );
};

export default TotalOrders;
