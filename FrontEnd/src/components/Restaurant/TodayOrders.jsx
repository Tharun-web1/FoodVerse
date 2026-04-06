import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import OrderTable from './OrderTable';
import { API_BASE_URL } from '../../api/api';

const TodayOrders = () => {
    const [orders, setOrders] = useState([]);
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
                const today = new Date();
                const todayDay = today.getDate();
                const todayMonth = today.getMonth();
                const todayYear = today.getFullYear();

                const todaysOrders = response.data.filter(order => {
                    if (!order.createdAt) return false;
                    const orderDate = new Date(order.createdAt);
                    return orderDate.getDate() === todayDay &&
                        orderDate.getMonth() === todayMonth &&
                        orderDate.getFullYear() === todayYear;
                });
                setOrders(todaysOrders);
            }
        } catch (error) {
            console.error("Error fetching today's orders:", error);
            setError("Failed to fetch today's orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (orderId, status) => {
        try {
            await axios.put(
                `${API_BASE_URL}/orders/${orderId}/status?status=${status}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
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
                    <h3 className="fw-bold mb-0 text-info">📅 Today's Orders</h3>
                    <button className="btn btn-primary px-4" onClick={fetchOrders} disabled={loading}>
                        {loading ? "Refreshing..." : "Refresh Data"}
                    </button>
                </div>

                {loading ? (
                    <div className="text-center mt-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Fetching today's orders...</p>
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

export default TodayOrders;
