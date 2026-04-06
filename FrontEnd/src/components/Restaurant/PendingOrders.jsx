import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from './Navbar';
import OrderTable from './OrderTable';

const PendingOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("restaurant_token");

    const fetchOrders = async () => {
        const restaurantId = localStorage.getItem("restaurantId");
        if (!restaurantId) return;

        setLoading(true);
        try {
            const response = await api.get(`/orders/restaurant/${restaurantId}`);
            if (response.data) {
                const pendingOrders = response.data.filter(order =>
                    ["PENDING", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"].includes(order.status)
                );
                setOrders(pendingOrders);
            }
        } catch (error) {
            console.error("Error fetching pending orders:", error);
            setError("Failed to fetch pending orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (orderId, status) => {
        try {
            await api.put(`/orders/${orderId}/status?status=${status}`);
            fetchOrders();
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status");
        }
    };

    return (
        <>
            <Navbar />
            <div className="container mt-5 mb-4 p-4 bg-white shadow-sm rounded" style={{"minHeight":"56vh"}}>
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <h3 className="fw-bold mb-0 text-warning">🚚 Pending Orders</h3>
                    <button className="btn btn-primary px-4" onClick={fetchOrders} disabled={loading}>
                        {loading ? "Refreshing..." : "Refresh Data"}
                    </button>
                </div>

                {loading ? (
                    <div className="text-center mt-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Fetching pending orders...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                ) : (
                    <OrderTable orders={orders} updateStatus={updateStatus} showActions={true} />
                )}
            </div>
        </>
    );
};

export default PendingOrders;
