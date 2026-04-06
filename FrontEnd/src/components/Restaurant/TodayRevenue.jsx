import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './Navbar';
import '../RestaurantCss/Revenue.css';
import axios from 'axios';
import { API_BASE_URL } from '../../api/api';
import { useNavigate } from 'react-router-dom';

const TodayRevenue = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            const resId = localStorage.getItem('restaurantId');

            if (!resId) return;

            try {
                const response = await axios.get(`${API_BASE_URL}/orders/restaurant/${resId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data) {
                    const now = new Date();
                    const todayDay = now.getDate();
                    const todayMonth = now.getMonth();
                    const todayYear = now.getFullYear();

                    const todaysOrders = response.data.filter(order => {
                        if (!order.createdAt) return false;
                        const dateObj = new Date(order.createdAt);
                        return dateObj.getDate() === todayDay &&
                            dateObj.getMonth() === todayMonth &&
                            dateObj.getFullYear() === todayYear;
                    });
                    setOrders(todaysOrders);
                }
            } catch (error) {
                console.error("Error fetching today's revenue data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const stats = useMemo(() => {
        let deliveredCount = 0;
        let totalEarnings = 0;

        const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
        deliveredCount = deliveredOrders.length;
        totalEarnings = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);

        return {
            totalOrders: orders.length,
            deliveredCount,
            totalEarnings
        };
    }, [orders]);

    return (
        <>
            <Navbar />
            <div className="revenue-container mt-5">
                <div className="revenue-header d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <button
                            className="btn btn-outline-secondary btn-sm mb-2"
                            onClick={() => navigate('/res/dash')}
                        >
                            ← Back to Dashboard
                        </button>
                        <h2 className="fw-bold text-info">📅 Today's Revenue</h2>
                        <p className="text-muted small">Detailed breakdown of earnings for {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="text-end bg-light p-3 rounded border shadow-sm">
                        <span className="text-muted small d-block">Today's Total Earnings</span>
                        <h3 className="fw-bold text-success mb-0">₹{stats.totalEarnings.toFixed(2)}</h3>
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm bg-primary text-white p-3">
                            <h5 className="small opacity-75">Total Orders Today</h5>
                            <h2 className="mb-0">{stats.totalOrders}</h2>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm bg-success text-white p-3">
                            <h5 className="small opacity-75">Delivered Orders</h5>
                            <h2 className="mb-0">{stats.deliveredCount}</h2>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm bg-info text-white p-3">
                            <h5 className="small opacity-75">Success Rate</h5>
                            <h2 className="mb-0">{stats.totalOrders > 0 ? ((stats.deliveredCount / stats.totalOrders) * 100).toFixed(0) : 0}%</h2>
                        </div>
                    </div>
                </div>

                <div className="revenue-table-container shadow-sm rounded border bg-white p-2">
                    <h5 className="p-3 border-bottom mb-0 fw-bold">Order Details</h5>
                    <table className="revenue-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Status</th>
                                <th>Time</th>
                                <th className="text-end">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                                        Loading today's transactions...
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">No orders found for today.</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="fw-bold text-primary">#{order.id}</td>
                                        <td>{order.customerName || "Customer"}</td>
                                        <td>
                                            <span className={`badge rounded-pill ${order.status === 'DELIVERED' ? 'bg-success' :
                                                    order.status === 'CANCELLED' || order.status === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="text-muted small">
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="amount-cell fw-bold">₹{order.totalAmount.toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default TodayRevenue;
