import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../Restaurant/Navbar';
import '../RestaurantCss/Revenue.css';
import axios from 'axios';
import { API_BASE_URL } from '../../api/api';

const Revenue = () => {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('daily'); // daily, weekly, monthly
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            const resId = localStorage.getItem('restaurantId');

            if (!resId) return;

            try {
                // The user's instruction and code edit seem to imply adding a new API call
                // for restaurant profile, but the instruction itself is to "change" an endpoint
                // that doesn't exist in the original code.
                // Assuming the user wants to add this profile fetch,
                // and the original order fetch should still happen.
                // The `setOrders(response.data)` line in the user's edit block
                // implies `response` should still be from the orders fetch.

                const response = await axios.get(`${API_BASE_URL}/orders/restaurant/${resId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(response.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const aggregatedData = useMemo(() => {
        if (!orders.length) return [];

        const grouped = {};

        orders.forEach(order => {
            if (!order.createdAt) return;
            const date = new Date(order.createdAt);
            let key;
            let displayDate;

            if (filter === 'daily') {
                key = date.toISOString().split('T')[0];
                displayDate = date.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
            } else if (filter === 'weekly') {
                // Get start of the week (Sunday)
                const d = new Date(date);
                const day = d.getDay();
                const diff = d.getDate() - day;
                const weekStart = new Date(d.setDate(diff));
                key = weekStart.toISOString().split('T')[0];
                displayDate = `Week of ${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
            } else if (filter === 'monthly') {
                key = `${date.getFullYear()}-${date.getMonth()}`;
                displayDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
            }

            if (!grouped[key]) {
                grouped[key] = {
                    date: displayDate,
                    rawDate: date, // For sorting
                    totalOrders: 0,
                    deliveredOrders: 0,
                    revenue: 0
                };
            }

            grouped[key].totalOrders += 1;

            if (order.status === 'DELIVERED') {
                grouped[key].deliveredOrders += 1;
                grouped[key].revenue += order.totalAmount;
            }
        });

        return Object.values(grouped).sort((a, b) => b.rawDate - a.rawDate);
    }, [orders, filter]);

    return (
        <>
            <Navbar />
            <div className="revenue-container mt-5">
                <div className="revenue-header">
                    <h2>Revenue & Earnings</h2>
                    <div className="revenue-controls">
                        <select
                            className="revenue-select"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="daily">Daily View</option>
                            <option value="weekly">Weekly View</option>
                            <option value="monthly">Monthly View</option>
                        </select>
                    </div>
                </div>

                <div className="revenue-table-container">
                    <table className="revenue-table">
                        <thead>
                            <tr>
                                <th>Date / Period</th>
                                <th>Total Orders</th>
                                <th>Delivered</th>
                                <th>Total Earnings</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center' }}>Loading data...</td>
                                </tr>
                            ) : aggregatedData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center' }}>No revenue data found for this period.</td>
                                </tr>
                            ) : (
                                aggregatedData.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.date}</td>
                                        <td className="order-count">{row.totalOrders}</td>
                                        <td className="order-count" style={{ color: '#38a169' }}>{row.deliveredOrders}</td>
                                        <td className="amount-cell">₹{row.revenue.toFixed(2)}</td>
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

export default Revenue;
