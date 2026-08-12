import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiX, FiTruck, FiNavigation } from 'react-icons/fi';
import { API_BASE_URL } from '../../api/api';
import '../UserCss/FloatingMap.css';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from "react-i18next";

const FloatingMap = () => {
    const { t } = useTranslation();
    const { token, isAuthenticated } = useAuth();
    const [order, setOrder] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // 🛡️ Path-based Visibility Guard
    const isExcludedPath = () => {
        const path = location.pathname;
        return (
            path.startsWith('/delivery') || 
            path.startsWith('/res') || 
            path.startsWith('/login') || 
            path.startsWith('/signup') ||
            path === '/orders' ||
            path.startsWith('/order-summary')
        );
    };

    const fetchActiveOrder = async () => {
        const validToken = token && token !== 'null' && token !== 'undefined';
        if (!validToken || !isAuthenticated || isExcludedPath()) {
            setIsVisible(false);
            setOrder(null);
            return;
        }

        try {
            const res = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const active = res.data.find(o => 
                o.status && ['placed', 'paid', 'accepted', 'preparing', 'out_for_delivery'].includes(o.status.toLowerCase())
            );
            
            if (active) {
                setOrder(active);
                setIsVisible(true);
            } else {
                setIsVisible(false);
                setOrder(null);
            }
        } catch (err) {
            console.error("Error fetching active order for floating track bar:", err);
            setIsVisible(false);
        }
    };

    useEffect(() => {
        fetchActiveOrder();
        const interval = setInterval(fetchActiveOrder, 20000);
        return () => clearInterval(interval);
    }, [token, location.pathname, isAuthenticated]);

    if (!isVisible || !order) return null;

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'placed':
            case 'paid':
                return 'Order Placed';
            case 'accepted':
                return 'Order Accepted';
            case 'preparing':
                return 'Preparing your food';
            case 'out_for_delivery':
                return 'Out for delivery';
            default:
                return 'Processing order';
        }
    };

    const resImage = order.restaurantId ? `${API_BASE_URL}/restaurants/${order.restaurantId}/image` : null;

    return (
        <div className="floating-track-bar-container animate__animated animate__slideInUp">
            <div 
                className="floating-track-bar-left" 
                onClick={() => navigate(`/order-summary/${order.id || order.transaction_id}`)}
            >
                <div className="track-avatar-wrapper">
                    {resImage ? (
                        <img 
                            src={resImage} 
                            alt={order.restaurantName} 
                            className="track-res-avatar" 
                            onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'flex';
                                }
                            }}
                        />
                    ) : null}
                    <div className="track-avatar-fallback" style={{ display: resImage ? 'none' : 'flex' }}>
                        <FiTruck />
                    </div>
                </div>
                <div className="track-res-text-box">
                    <span className="track-res-name">{order.restaurantName}</span>
                    <span className="track-status-sub">{getStatusText(order.status)}</span>
                </div>
            </div>

            <div className="floating-track-bar-right">
                <button 
                    className="track-order-pill-btn" 
                    onClick={() => navigate(`/order-summary/${order.id || order.transaction_id}`)}
                >
                    <span>{t("track_order") || "Track Order"}</span>
                    <FiNavigation className="nav-icon" />
                </button>
                <button 
                    className="clear-track-dismiss-btn" 
                    onClick={() => setIsVisible(false)} 
                    title="Dismiss"
                >
                    <FiX />
                </button>
            </div>
        </div>
    );
};

export default FloatingMap;


