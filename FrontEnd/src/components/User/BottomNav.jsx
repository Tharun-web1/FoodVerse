import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiShoppingBag, FiList, FiUser } from 'react-icons/fi';
import { useCart } from './CartContext';
import { useTranslation } from 'react-i18next';
import '../UserCss/BottomNav.css';

const BottomNav = ({ onProfileToggle, onSearchToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const { cartItems } = useCart();
    const cartItemCount = cartItems.reduce((total, item) => total + item.qty, 0);

    const isActive = (path) => location.pathname === path;

    return (
        <div className="bottom-nav">
            <button
                className={`bottom-nav-item ${isActive('/user') ? 'active' : ''}`}
                onClick={() => navigate('/user')}
            >
                <FiHome />
                <span>{t('home')}</span>
            </button>
            <button
                className="bottom-nav-item"
                onClick={() => {
                    if (onSearchToggle) {
                        onSearchToggle();
                    } else {
                        navigate('/user');
                    }
                }}
            >
                <FiSearch />
                <span>{t('search')}</span>
            </button>
            <button
                className={`bottom-nav-item ${isActive('/cart') ? 'active' : ''}`}
                onClick={() => navigate('/cart')}
            >
                <div className="cart-icon-wrapper">
                    <FiShoppingBag />
                    {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
                </div>
                <span>{t('cart')}</span>
            </button>
            <button
                className={`bottom-nav-item ${isActive('/orders') ? 'active' : ''}`}
                onClick={() => navigate('/orders')}
            >
                <FiList />
                <span>{t('orders')}</span>
            </button>
            <button
                className="bottom-nav-item"
                onClick={onProfileToggle}
            >
                <FiUser />
                <span>{t('profile')}</span>
            </button>
        </div>
    );
};

export default BottomNav;
