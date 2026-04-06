import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import OrderTable from './OrderTable';
import { API_BASE_URL } from '../../api/api';

const DeliveredOrders = () => {
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
                const deliveredOrders = response.data.filter(order => order.status === "DELIVERED");
                setOrders(deliveredOrders);
            }
        } catch (error) {
            console.error("Error fetching delivered orders:", error);
            setError("Failed to fetch delivered orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <>
            <Navbar />
            <div className="container mt-5 mb-4 p-4 bg-white shadow-sm rounded" style={{"minHeight":"56vh"}}>
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <h3 className="fw-bold mb-0 text-success">✅ Delivered Orders</h3>
                    <button className="btn btn-primary px-4" onClick={fetchOrders} disabled={loading}>
                        {loading ? "Refreshing..." : "Refresh Data"}
                    </button>
                </div>

                {loading ? (
                    <div className="text-center mt-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Fetching delivered orders...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                ) : (
                    <OrderTable orders={orders} showActions={false} />
                )}
            </div>
        </>
    );
};

export default DeliveredOrders;
