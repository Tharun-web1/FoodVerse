import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiArrowLeft, FiZap, FiTruck, FiClock, FiShield,
    FiCheck, FiStar, FiAward, FiSmartphone, FiCreditCard, FiX, FiCheckCircle
} from 'react-icons/fi';
import Navbar from './Navbar';
import FloatingMap from './FloatingMap';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../../api/api';
import '../UserCss/BitezyOne.css';

const BitezyOne = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { user, token } = useAuth();

    // Check if member status is already saved in localStorage
    const [isMember, setIsMember] = useState(() => {
        return localStorage.getItem('isBitezyOneMember') === 'true';
    });

    const [walletBalance, setWalletBalance] = useState(250);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    useEffect(() => {
        if (token) {
            axios.get(`${API_BASE_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                if (res.data && res.data.walletBalance !== undefined) {
                    setWalletBalance(res.data.walletBalance);
                }
            }).catch(err => console.error("Error fetching wallet balance in BitezyOne", err));
        }
    }, [token]);

    const plans = [
        {
            id: 'trial_1m',
            name: '1 Month Trial Pass',
            tagline: 'Special launch offer for new members',
            price: 1,
            regularPrice: 39,
            period: '1 Month',
            isPopular: false,
            badge: '₹1 LAUNCH DEAL',
            benefits: [
                'Unlimited Free Delivery on food orders above ₹99',
                'Member-exclusive discounts & offers',
                'Priority customer support'
            ]
        },
        {
            id: 'power_3m',
            name: '3 Months Power Pass',
            tagline: 'Most popular plan • Save maximum on every order',
            price: 99,
            regularPrice: 199,
            period: '3 Months',
            isPopular: true,
            badge: 'BEST VALUE • ₹33/mo',
            benefits: [
                'Unlimited Free Delivery on food orders above ₹99',
                'Priority Rush Delivery during peak hours',
                'Zero Surge Charges (Rain & peak packaging fee waiver)',
                '10% Instant Wallet Cashback on all orders'
            ]
        }
    ];

    const [selectedPlan, setSelectedPlan] = useState(plans[1]);
    const [monthlyOrders, setMonthlyOrders] = useState(6);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('wallet');
    const [activating, setActivating] = useState(false);
    const [dbSavings, setDbSavings] = useState(0);

    useEffect(() => {
        const fetchUserSavings = async () => {
            if (!token) return;
            try {
                const res = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (Array.isArray(res.data)) {
                    const computed = res.data.reduce((sum, order) => {
                        const status = (order.status || '').toLowerCase();
                        if (['cancelled', 'rejected', 'failed'].includes(status)) return sum;
                        const couponSavings = Number(order.discountAmount || order.discount || order.couponDiscount || 0);
                        const deliverySavings = (order.deliveryFee === 0 || order.delivery_fee === 0 || order.freeDelivery) ? 35 : 0;
                        return sum + couponSavings + deliverySavings;
                    }, 0);
                    setDbSavings(computed);
                    localStorage.setItem('bitezyOneSavings', computed.toString());
                }
            } catch (err) {
                console.error("Error fetching user savings in BitezyOne page:", err);
            }
        };
        fetchUserSavings();
    }, [token]);

    // Dynamic savings calculation
    const avgDeliveryFee = 45;
    const perkValue = selectedPlan.id === 'power_3m' ? 120 : 0;
    const calculatedSavings = (monthlyOrders * avgDeliveryFee) + perkValue;

    const getDaysRemaining = () => {
        const expiryStr = localStorage.getItem('bitezyOneExpiry');
        if (!expiryStr) return 0;
        const expiryDate = new Date(expiryStr);
        const now = new Date();
        const diffTime = expiryDate.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diffTime / (1000 * 3600 * 24)));
    };
    const daysRemaining = getDaysRemaining();
    const canRenew = isMember && daysRemaining <= 15;

    const handleOpenPaymentModal = () => {
        setShowPaymentModal(true);
    };

    const handleActivatePlan = () => {
        // 1. Wallet Payment Validation
        if (paymentMethod === 'wallet') {
            if (walletBalance < selectedPlan.price) {
                showToast(
                    `Insufficient Wallet Balance! Available: ₹${walletBalance.toFixed(0)}. Please choose UPI or Card, or add money to your wallet.`,
                    "error"
                );
                return;
            }

            setActivating(true);
            setTimeout(() => {
                setWalletBalance(prev => Math.max(0, prev - selectedPlan.price));

                const now = new Date();
                const daysToAdd = selectedPlan.id === 'trial_1m' ? 30 : 90;
                now.setDate(now.getDate() + daysToAdd);
                const expiryStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

                localStorage.setItem('isBitezyOneMember', 'true');
                localStorage.setItem('bitezyOnePlan', selectedPlan.name);
                localStorage.setItem('bitezyOnePlanId', selectedPlan.id);
                localStorage.setItem('bitezyOneSavings', dbSavings.toString());
                localStorage.setItem('bitezyOneExpiry', expiryStr);

                setIsMember(true);
                setActivating(false);
                setShowPaymentModal(false);
                showToast(`Welcome to Bitezy One! ${selectedPlan.name} Activated!`, "success");
            }, 800);
            return;
        }

        // 2. UPI / Card Online Payment via Razorpay
        if (!window.Razorpay) {
            showToast("Payment Gateway loading... Please try again in a moment.", "warning");
            return;
        }

        setActivating(true);
        const options = {
            key: "rzp_live_S2zMP8KB5nUyga", // Razorpay Key ID
            amount: (selectedPlan.price * 100).toString(),
            currency: "INR",
            name: "Bitezy One Membership",
            description: `${selectedPlan.name} (${selectedPlan.period})`,
            prefill: {
                name: user?.username || user?.name || "Member",
                email: user?.email || "user@foodverse.com",
                contact: user?.phoneNumber || user?.phone || "9999999999"
            },
            theme: {
                color: "#d4af37"
            },
            handler: function (response) {
                const now = new Date();
                const daysToAdd = selectedPlan.id === 'trial_1m' ? 30 : 90;
                now.setDate(now.getDate() + daysToAdd);
                const expiryStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

                localStorage.setItem('isBitezyOneMember', 'true');
                localStorage.setItem('bitezyOnePlan', selectedPlan.name);
                localStorage.setItem('bitezyOnePlanId', selectedPlan.id);
                localStorage.setItem('bitezyOneSavings', dbSavings.toString());
                localStorage.setItem('bitezyOneExpiry', expiryStr);

                setIsMember(true);
                setActivating(false);
                setShowPaymentModal(false);
                showToast(`Welcome to Bitezy One! ${selectedPlan.name} Activated!`, "success");
            },
            modal: {
                ondismiss: function () {
                    setActivating(false);
                    showToast("Payment cancelled", "info");
                }
            }
        };

        try {
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Razorpay Error:", err);
            setActivating(false);
            showToast("Failed to open Razorpay payment modal", "error");
        }
    };

    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/profile');
        }
    };

    return (
        <>
            <Navbar />
            <div className="bitezy-one-page">
                {/* Hero Header */}
                <section className="one-hero">
                    <div className="one-hero-glow"></div>
                    <div className="one-hero-inner">
                        <button className="one-back-btn" onClick={handleBack} aria-label="Go Back">
                            <FiArrowLeft /> Back to Profile
                        </button>

                        <div className="one-brand-tag">
                            <FiAward /> BITEZY VIP MEMBERSHIP
                        </div>

                        <div className="one-title-block">
                            <h1>Unlimited Free Delivery & VIP Benefits</h1>
                            <p>Join Bitezy One today to unlock free delivery on orders above ₹99, priority rider dispatch, and zero surge charges.</p>
                        </div>

                        {/* Savings Banner */}
                        <div className="one-savings-banner">
                            <div className="savings-left">
                                <div className="savings-icon-box">
                                    <FiZap />
                                </div>
                                <div className="savings-text">
                                    <h4>{isMember ? `Bitezy One Active (${localStorage.getItem('bitezyOnePlan') || selectedPlan.name})` : 'Average Member Savings'}</h4>
                                    <p>{isMember ? `You saved ₹${dbSavings || localStorage.getItem('bitezyOneSavings') || 0} so far! Valid till ${localStorage.getItem('bitezyOneExpiry') || '30 days'}` : 'Members save an average of ₹350 per month'}</p>
                                </div>
                            </div>
                            {isMember && <span className="active-status-pill">ACTIVE VIP MEMBER</span>}
                        </div>
                    </div>
                </section>

                <div className="one-container">
                    {/* Pricing Tier Grid */}
                    <div className="pricing-section-title">
                        <FiStar style={{ color: '#ffd700' }} /> Choose Your Bitezy One Membership
                    </div>

                    <div className="plans-grid two-plans">
                        {plans.map(plan => (
                            <div
                                key={plan.id}
                                className={`plan-card ${plan.isPopular ? 'popular' : ''} ${selectedPlan.id === plan.id ? 'selected' : ''}`}
                                onClick={() => setSelectedPlan(plan)}
                            >
                                {plan.badge && <span className="plan-badge">{plan.badge}</span>}
                                <div className="plan-header">
                                    <h3>{plan.name}</h3>
                                    <p>{plan.tagline}</p>
                                </div>

                                <div className="plan-price-block">
                                    <span className="price">₹{plan.price}</span>
                                    <span className="period">/ {plan.period}</span>
                                    <span className="regular-price">₹{plan.regularPrice}</span>
                                </div>

                                <div className="plan-benefits-preview">
                                    {(plan.benefits || plan.features || []).map((b, idx) => (
                                        <div key={idx} className="plan-benefit-item">
                                            <FiCheck className="check-icon" />
                                            <span>{b}</span>
                                        </div>
                                    ))}
                                </div>

                                <button className="plan-select-btn">
                                    {selectedPlan.id === plan.id ? '✓ Selected Plan' : 'Select Plan'}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Member Benefits Grid */}
                    <div className="benefits-section">
                        <div className="pricing-section-title">
                            <FiShield style={{ color: '#10b981' }} /> Exclusive Member Perks Breakdown
                        </div>
                        <div className="benefits-grid">
                            <div className="benefit-card">
                                <div className="benefit-icon gold">
                                    <FiTruck />
                                </div>
                                <div className="benefit-text">
                                    <h4>Unlimited Free Delivery</h4>
                                    <p>No delivery fee on all food orders above <strong>₹99</strong> from top restaurants.</p>
                                    <span className="perk-plan-tag">Included in 1-Month & 3-Month</span>
                                </div>
                            </div>

                            <div className="benefit-card">
                                <div className="benefit-icon green">
                                    <FiClock />
                                </div>
                                <div className="benefit-text">
                                    <h4>Priority Rush Dispatch</h4>
                                    <p>Instant dispatch queue priority for your orders during peak lunch and dinner hours.</p>
                                    <span className="perk-plan-tag highlight">Exclusive to 3-Month Pass</span>
                                </div>
                            </div>

                            <div className="benefit-card">
                                <div className="benefit-icon purple">
                                    <FiShield />
                                </div>
                                <div className="benefit-text">
                                    <h4>Zero Surge Charges</h4>
                                    <p>100% waiver on rain surge, bad weather fees, and peak hour packaging surcharges.</p>
                                    <span className="perk-plan-tag highlight">Exclusive to 3-Month Pass</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Savings Calculator */}
                    <div className="calc-box">
                        <div className="calc-header">
                            <h3>Calculate Your Monthly Savings</h3>
                        </div>

                        <div className="calc-slider-group">
                            <label>How many times do you order per month? ({monthlyOrders} Orders/mo)</label>
                            <input
                                type="range"
                                min="2"
                                max="20"
                                value={monthlyOrders}
                                onChange={(e) => setMonthlyOrders(parseInt(e.target.value))}
                                className="calc-slider"
                            />
                        </div>

                        <div className="calc-result-row">
                            <div className="calc-result-left">
                                <p>Estimated Savings with {selectedPlan.name}</p>
                                <h4>₹{calculatedSavings} / month</h4>
                            </div>
                            <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '700' }}>
                                Covers {selectedPlan.name} cost in just 1 order!
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sticky Activation Footer */}
                <div className="one-action-bar">
                    <div className="one-action-inner">
                        <div className="action-plan-summary">
                            <span className="action-plan-name">
                                {selectedPlan.name}
                                {isMember && (
                                    <small style={{ display: 'block', fontSize: '11px', color: canRenew ? '#f59e0b' : '#10b981', fontWeight: '700', marginTop: '2px' }}>
                                        {canRenew ? `Expiring in ${daysRemaining} days` : `VIP Active • Valid for ${daysRemaining} days`}
                                    </small>
                                )}
                            </span>
                            <span className="action-plan-price">
                                ₹{selectedPlan.price} <small style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '500' }}>total</small>
                            </span>
                        </div>
                        {isMember && !canRenew ? (
                            <button
                                className="activate-btn active-vip-btn"
                                disabled
                                style={{ background: '#059669', color: '#ffffff', cursor: 'default', opacity: 0.95 }}
                            >
                                ✓ VIP Active ({daysRemaining} Days Left)
                            </button>
                        ) : (
                            <button
                                className="activate-btn"
                                onClick={handleOpenPaymentModal}
                            >
                                {isMember ? 'Renew Membership' : `Activate for ₹${selectedPlan.price}`}
                            </button>
                        )}
                    </div>
                </div>

                {/* Checkout Activation Modal */}
                {showPaymentModal && (
                    <div className="one-modal-overlay" onClick={() => setShowPaymentModal(false)}>
                        <div className="one-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Activate Bitezy One</h3>
                                <button className="modal-close-btn" onClick={() => setShowPaymentModal(false)}>
                                    <FiX />
                                </button>
                            </div>

                            <div className="modal-plan-summary-card">
                                <div className="modal-plan-left">
                                    <h4>{selectedPlan.name}</h4>
                                    <p>{selectedPlan.period}</p>
                                </div>
                                <div className="modal-plan-price">
                                    <span>₹{selectedPlan.price}</span>
                                    {selectedPlan.regularPrice > selectedPlan.price && (
                                        <small className="modal-strike-price">₹{selectedPlan.regularPrice}</small>
                                    )}
                                </div>
                            </div>

                            <div className="modal-payment-section">
                                <h4>Select Payment Method</h4>

                                <div className="payment-options-list">
                                    <label className={`payment-option-card ${paymentMethod === 'wallet' ? 'active' : ''} ${walletBalance < selectedPlan.price ? 'insufficient' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="wallet"
                                            checked={paymentMethod === 'wallet'}
                                            onChange={() => setPaymentMethod('wallet')}
                                        />
                                        <div className="option-info">
                                            <div className="option-title-group">
                                                <FiSmartphone className="option-icon" />
                                                <div className="option-text-wrap">
                                                    <span className="option-title">Bitezy Money Wallet</span>
                                                    <span className="option-sub">Available Balance: ₹{walletBalance.toFixed(0)}</span>
                                                </div>
                                            </div>
                                            {walletBalance < selectedPlan.price && (
                                                <span className="insufficient-funds-tag">Insufficient Funds</span>
                                            )}
                                        </div>
                                    </label>

                                    <label className={`payment-option-card ${paymentMethod === 'upi' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="upi"
                                            checked={paymentMethod === 'upi'}
                                            onChange={() => setPaymentMethod('upi')}
                                        />
                                        <div className="option-info">
                                            <div className="option-title-group">
                                                <FiZap className="option-icon" />
                                                <div className="option-text-wrap">
                                                    <span className="option-title">UPI Instant Payment</span>
                                                    <span className="option-sub">Google Pay / PhonePe / Paytm / BHIM</span>
                                                </div>
                                            </div>
                                        </div>
                                    </label>

                                    <label className={`payment-option-card ${paymentMethod === 'card' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="card"
                                            checked={paymentMethod === 'card'}
                                            onChange={() => setPaymentMethod('card')}
                                        />
                                        <div className="option-info">
                                            <div className="option-title-group">
                                                <FiCreditCard className="option-icon" />
                                                <div className="option-text-wrap">
                                                    <span className="option-title">Credit / Debit Card</span>
                                                    <span className="option-sub">Visa, Mastercard, RuPay</span>
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button
                                className="confirm-pay-btn"
                                onClick={handleActivatePlan}
                                disabled={activating}
                            >
                                {activating ? 'Activating VIP Membership...' : `Confirm & Pay ₹${selectedPlan.price}`}
                            </button>
                        </div>
                    </div>
                )}

                <FloatingMap />
            </div>
        </>
    );
};

export default BitezyOne;

