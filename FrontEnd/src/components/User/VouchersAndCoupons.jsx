import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import FloatingMap from './FloatingMap';
import { API_BASE_URL } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiTag, FiCopy, FiCheck, FiPercent, FiGift } from 'react-icons/fi';
import '../UserCss/VouchersAndCoupons.css';

const VouchersAndCoupons = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState(null);

    const getCleanText = (key, fallback) => {
        const val = t(key);
        if (!val || val === key || val.includes('_')) return fallback;
        return val;
    };

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/coupons/all`);
            setCoupons(res.data || []);
        } catch (err) {
            console.error("Error fetching vouchers & coupons:", err);
            setCoupons([
                { id: 1, code: 'WELCOME50', discountType: 'PERCENTAGE', discountValue: 50, minOrderAmount: 199, description: 'Get 50% OFF on your first food order!' },
                { id: 2, code: 'BITEZY100', discountType: 'FLAT', discountValue: 100, minOrderAmount: 399, description: 'Flat ₹100 OFF on orders above ₹399.' },
                { id: 3, code: 'FREEDEL', discountType: 'FLAT', discountValue: 40, minOrderAmount: 149, description: 'Free delivery voucher on your order.' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const copyCouponCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        showToast(`Coupon ${code} copied!`, "success");
        setTimeout(() => setCopiedCode(null), 3000);
    };

    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/profile', { state: { openProfileSidebar: true } });
        }
    };

    return (
        <>
            <Navbar />
            <div className="vouchers-coupons-page">
                <div className="vouchers-container">
                    <header className="page-header-v3">
                        <div className="header-main-row">
                            <button className="back-btn-v3" onClick={handleBack} type="button" aria-label="Go Back">
                                <FiArrowLeft />
                            </button>
                            <h1 className="page-title">{getCleanText("my_vouchers_coupons", "My Vouchers & Coupons 🎟️")}</h1>
                        </div>
                        <p className="page-subtitle">Save big on your orders with active promo vouchers</p>
                    </header>

                    {/* HERO CARDS BANNER */}
                    <div className="vouchers-hero-banner animate__animated animate__fadeIn">
                        <div className="banner-badge">AVAILABLE OFFERS</div>
                        <h2>Unlock Maximum Savings! 🎉</h2>
                        <p>Copy coupon codes and apply them during checkout to get instant discounts.</p>
                    </div>

                    {/* COUPONS LIST */}
                    {loading ? (
                        <div className="coupons-skeleton">
                            <div className="shimmer-card"></div>
                            <div className="shimmer-card"></div>
                        </div>
                    ) : coupons.length > 0 ? (
                        <div className="coupons-ticket-grid">
                            {coupons.map((cp) => (
                                <div key={cp.id || cp.code} className="coupon-ticket-card animate__animated animate__fadeInUp">
                                    <div className="ticket-left-stub">
                                        <div className="discount-value-box">
                                            <span className="val">
                                                {cp.discountType === 'PERCENTAGE' ? `${cp.discountValue}%` : `₹${cp.discountValue}`}
                                            </span>
                                            <span className="lbl">OFF</span>
                                        </div>
                                        <div className="stub-divider-line"></div>
                                    </div>

                                    <div className="ticket-main-content">
                                        <div className="ticket-header-row">
                                            <div className="code-pill">{cp.code}</div>
                                            <button 
                                                className={`copy-code-pill-btn ${copiedCode === cp.code ? 'copied' : ''}`}
                                                onClick={() => copyCouponCode(cp.code)}
                                            >
                                                {copiedCode === cp.code ? <><FiCheck /> COPIED</> : <><FiCopy /> COPY CODE</>}
                                            </button>
                                        </div>

                                        <p className="ticket-desc">{cp.description || `Get discount on orders above ₹${cp.minOrderAmount || 0}`}</p>
                                        
                                        <div className="ticket-footer-row">
                                            <span className="min-order">Min. Order: ₹{cp.minOrderAmount || 0}</span>
                                            <span className="validity">Valid for active orders</span>
                                        </div>
                                    </div>

                                    {/* Ticket cutouts decoration */}
                                    <div className="ticket-cutout top"></div>
                                    <div className="ticket-cutout bottom"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-coupons-empty-state">
                            <div className="empty-icon-circle">
                                <FiTag />
                            </div>
                            <h3>{t("no_coupons_available") || "No Coupons Available"}</h3>
                            <p>Check back later for exciting new discounts and promotional vouchers!</p>
                            <button className="explore-btn" onClick={() => navigate('/user')}>
                                Explore Restaurants
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <FloatingMap />
        </>
    );
};

export default VouchersAndCoupons;
