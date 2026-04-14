import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiShoppingBag, FiArrowRight, FiClock, FiTruck, FiPackage } from 'react-icons/fi';
import api from '../../services/api';
import '../UserCss/FloatingOrder.css';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from "react-i18next";

const FloatingOrder = () => {
    const { t } = useTranslation();
    const { token, isAuthenticated } = useAuth();
    const [activeOrder, setActiveOrder] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();

    // 🛡️ Path-based Visibility Guard
    const isExcludedPath = () => {
        const path = location.pathname;
        return (
            path.startsWith('/delivery') || 
            path.startsWith('/res') || 
            path.startsWith('/login') || 
            path.startsWith('/signup') ||
            path === '/orders'
        );
    };

    const fetchActiveOrders = async () => {
        // Robust token and path check
        const validToken = token && token !== 'null' && token !== 'undefined';
        
        if (!validToken || !isAuthenticated || isExcludedPath()) {
            setIsVisible(false);
            setActiveOrder(null);
            return;
        }
        
        try {
            const res = await api.get('/orders/my-orders');
            
            // Find the most recent active order (not DELIVERED or CANCELLED)
            const active = res.data.find(order => 
                order.status && 
                order.status && ['placed', 'paid', 'accepted', 'preparing', 'out_for_delivery'].includes(order.status.toLowerCase())
            );
            
            if (active) {
                setActiveOrder(active);
                setIsVisible(true);
            } else {
                setIsVisible(false);
                setActiveOrder(null);
            }
        } catch (err) {
            console.error("Error fetching active orders for floating widget:", err);
            // If we get an auth error, hide the widget
            if (err.response?.status === 401) {
                setIsVisible(false);
                setActiveOrder(null);
            }
        }
    };

    useEffect(() => {
        fetchActiveOrders();
        
        // Poll every 15 seconds if visible, otherwise 60 seconds
        const pollInterval = isVisible ? 15000 : 60000;
        const interval = setInterval(fetchActiveOrders, pollInterval);
        
        return () => clearInterval(interval);
    }, [token, location.pathname, isAuthenticated, isVisible]);

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <FiClock />;
            case 'placed': return <FiPackage />;
            case 'preparing': return <FiPackage />;
            case 'out_for_delivery': return <FiTruck />;
            default: return <FiShoppingBag />;
        }
    };

const getStatusText = (status) => {
    if (!status) return t('processing');

    const statusKey = status.toLowerCase();
    // Return translated status if key exists, otherwise format original status
    return t(statusKey) !== statusKey 
        ? t(statusKey) 
        : status
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
};

    if (!isVisible || !activeOrder) return null;

    // Don't show on admin or specialized dashboards
    if (location.pathname.startsWith('/delivery') || location.pathname.startsWith('/res')) {
        return null;
    }

    // Don't show on orders page to avoid redundancy
    if (location.pathname === '/orders') return null;

    return (
        <div className="floating-order-widget slide-up shadow-lg">
            <Link 
                to={`/order-summary/${activeOrder.id || activeOrder.transaction_id}`} 
                className="floating-order-content"
            >
                <div className="status-icon-wrapper pulse">
                    {getStatusIcon(activeOrder.status)}
                </div>
                <div className="order-details-mini">
                    <span className="order-status-label">{getStatusText(activeOrder.status)}</span>
                    <span className="order-res-name">{activeOrder.restaurantName}</span>
                </div>
                <div className="track-link">
                    <span>{t("track")}</span>
                    <FiArrowRight />
                </div>
            </Link>
        </div>
    );
};

export default FloatingOrder;
