import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiX, FiClock, FiArrowRight, FiTruck } from 'react-icons/fi';
import { API_BASE_URL } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import '../UserCss/FloatingOrderWidget.css';

const FloatingOrderWidget = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [activeOrder, setActiveOrder] = useState(null);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        if (!token || isDismissed) return;

        const checkActiveOrders = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const orders = res.data || [];
                // Find order in PLACED, PREPARING, OUT_FOR_DELIVERY status
                const active = orders.find(o => {
                    const status = (o.status || '').toUpperCase();
                    return status === 'PLACED' || status === 'PREPARING' || status === 'OUT_FOR_DELIVERY' || status === 'CONFIRMED';
                });
                setActiveOrder(active || null);
            } catch (err) {
                console.error("Error fetching active order for mini-tracker:", err);
            }
        };

        checkActiveOrders();
        const interval = setInterval(checkActiveOrders, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, [token, isDismissed]);

    if (!activeOrder || isDismissed) return null;

    const orderId = activeOrder.id || activeOrder.transaction_id;
    const status = (activeOrder.status || 'PREPARING').toUpperCase();

    const getStatusText = () => {
        switch (status) {
            case 'PLACED':
            case 'CONFIRMED':
                return { label: 'Order Confirmed', msg: 'Restaurant accepted your order' };
            case 'PREPARING':
                return { label: 'Preparing Food', msg: 'Chef is cooking your meal' };
            case 'OUT_FOR_DELIVERY':
                return { label: 'Out for Delivery', msg: 'Rider is on the way to you!' };
            default:
                return { label: 'Active Order', msg: 'Your order is in progress' };
        }
    };

    const statusInfo = getStatusText();

    return (
        <div className="floating-order-widget-container">
            <div className="floating-order-card">
                <div className="widget-top-row">
                    <div className="widget-status-badge">
                        <div className="pulse-dot-container">
                            <div className="pulse-dot"></div>
                            <div className="pulse-ring"></div>
                        </div>
                        <span style={{ color: '#10b981' }}>{statusInfo.label}</span>
                    </div>
                    <button 
                        className="widget-close-btn" 
                        onClick={() => setIsDismissed(true)}
                        aria-label="Dismiss Order Tracker"
                    >
                        <FiX />
                    </button>
                </div>

                <div className="widget-content-row">
                    <div className="widget-info">
                        <h4 className="widget-res-name">{activeOrder.restaurantName || `Order #${orderId}`}</h4>
                        <p className="widget-status-msg">{statusInfo.msg}</p>
                    </div>

                    <div className="widget-eta-badge">
                        <FiClock /> ETA ~12 mins
                    </div>
                </div>

                <button 
                    className="widget-track-btn"
                    onClick={() => navigate(`/order-summary/${orderId}`)}
                >
                    <FiTruck /> Track Order Live <FiArrowRight />
                </button>
            </div>
        </div>
    );
};

export default FloatingOrderWidget;
