import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from './CartContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_BASE_URL } from '../../api/api';
import '../UserCss/FloatingCart.css';

const FloatingCartBar = ({ resId, items, clearCartForRes }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setActiveRestaurantId } = useCart();
    const [restaurant, setRestaurant] = useState(null);
    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
        if (isConfirming) {
            const timer = setTimeout(() => {
                setIsConfirming(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isConfirming]);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/restaurants/${resId}`)
            .then(res => {
                setRestaurant(res.data);
            })
            .catch(err => {
                console.error(`Error fetching restaurant details for floating cart resId ${resId}:`, err);
            });
    }, [resId]);

    const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * item.qty), 0);
    const resName = restaurant?.name || items[0]?.restaurantName || items[0]?.resName || "Restaurant";

    const handleViewCart = () => {
        setActiveRestaurantId(resId);
        navigate(`/cart?resId=${resId}`);
    };

    return (
        <div className="floating-cart-summary animate__animated animate__slideInUp">
            <div className="cart-summary-left" style={{ cursor: 'pointer' }} onClick={() => navigate(`/restaurant/${resId}`)}>
                <img
                    src={restaurant?.image || `${API_BASE_URL}/restaurants/${resId}/image`}
                    alt={resName}
                    className="cart-summary-thumb"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=80&auto=format&fit=crop"; }}
                />
                <div className="cart-summary-text">
                    <span className="cart-summary-res-name">{resName}</span>
                    <span className="cart-summary-view-menu">{t("view_menu") || "View Menu"} <span className="red-arrow">▸</span></span>
                </div>
            </div>
            <div className="cart-summary-right">
                <button className="view-cart-pill-btn" onClick={handleViewCart}>
                    <div className="view-cart-btn-content">
                        <span className="view-cart-title">{t("view_cart") || "View Cart"}</span>
                        <span className="view-cart-count">
                            {itemCount} {itemCount === 1 ? t("item") || "item" : t("items") || "items"} • ₹{subtotal}
                        </span>
                    </div>
                    <span className="view-cart-arrow">→</span>
                </button>
                {isConfirming ? (
                    <button 
                        className="clear-cart-remove-btn" 
                        onClick={() => {
                            clearCartForRes();
                            setIsConfirming(false);
                        }} 
                        title="Confirm Remove"
                    >
                        {t("remove") || "Remove"}
                    </button>
                ) : (
                    <button 
                        className="clear-cart-dismiss-btn" 
                        onClick={() => setIsConfirming(true)} 
                        title="Remove Cart"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};

const FloatingCart = () => {
    const location = useLocation();
    const { carts, clearCart } = useCart();

    const isExcludedPath = () => {
        const path = location.pathname;
        const ownerRestaurantPaths = [
            '/restaurant/login',
            '/restaurant/signup',
            '/restaurant/dashboard',
            '/restaurant/menu',
            '/restaurant/items',
            '/restaurant/details',
            '/restaurant/orders',
            '/restaurant/revenue',
            '/restaurant/coupons',
            '/restaurant/history'
        ];

        if (ownerRestaurantPaths.some(p => path.startsWith(p))) {
            return true;
        }

        return (
            path.startsWith('/delivery') ||
            path.startsWith('/delivery-partner') || 
            path.startsWith('/res/') || 
            path.startsWith('/login') || 
            path.startsWith('/signup') ||
            path === '/profile' ||
            path === '/cart' ||
            path === '/payment' ||
            path.startsWith('/order-summary') ||
            path === '/orders'
        );
    };

    if (isExcludedPath()) {
        return null;
    }

    // Filter and sort active carts by current restaurant path then lastUpdated descending
    const match = location.pathname.match(/\/restaurant\/([^/]+)/);
    const currentResId = match ? match[1] : null;

    const activeResIds = Object.keys(carts || {})
        .filter(resId => carts[resId]?.items?.length > 0)
        .sort((a, b) => {
            if (currentResId) {
                if (a === currentResId) return -1;
                if (b === currentResId) return 1;
            }
            const timeA = carts[a]?.lastUpdated || 0;
            const timeB = carts[b]?.lastUpdated || 0;
            return timeB - timeA;
        });

    if (activeResIds.length === 0) {
        return null;
    }

    // Mobile View Optimization limit: top 2 most active carts.
    const isMobile = window.innerWidth <= 768;
    const displayLimit = isMobile ? 2 : 3;
    const visibleResIds = activeResIds.slice(0, displayLimit);

    return (
        <div className="floating-carts-container">
            {visibleResIds.map(resId => (
                <FloatingCartBar
                    key={resId}
                    resId={resId}
                    items={carts[resId].items}
                    clearCartForRes={() => clearCart(resId)}
                />
            ))}
        </div>
    );
};

export default FloatingCart;
