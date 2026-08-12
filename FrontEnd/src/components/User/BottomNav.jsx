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
    const { totalItemsCount } = useCart();
    const cartItemCount = totalItemsCount;

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
                className={`bottom-nav-item ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => {
                    if (onProfileToggle) onProfileToggle();
                    if (location.pathname !== "/profile") {
                        navigate("/profile");
                    }
                }}
            >
                <span style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: '#e11d48',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '2px'
                }}>
                    {(localStorage.getItem("username") || "Roy").charAt(0).toUpperCase()}
                </span>
                <span>{t('profile')}</span>
            </button>
        </div>
    );
};

export default BottomNav;
