import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    FiArrowLeft, FiSearch, FiPackage, FiCreditCard, FiTag, 
    FiUser, FiMessageSquare, FiPhoneCall, FiMail, FiChevronDown, 
    FiChevronRight, FiClock, FiHelpCircle 
} from 'react-icons/fi';
import Navbar from './Navbar';
import FloatingMap from './FloatingMap';
import { API_BASE_URL } from '../../api/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import '../UserCss/HelpSupport.css';

const HelpSupport = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    // Fetch recent orders for quick assistance
    useEffect(() => {
        const fetchRecentOrders = async () => {
            if (!token) {
                setLoadingOrders(false);
                return;
            }
            try {
                const res = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const list = (res.data || []).slice(0, 2);
                setRecentOrders(list);
            } catch (err) {
                console.error("Error fetching recent orders for help hub:", err);
            } finally {
                setLoadingOrders(false);
            }
        };
        fetchRecentOrders();
    }, [token]);

    const categories = [
        { id: 'orders', title: t('order_help', 'Order Help'), subtitle: 'Missing items, late delivery, food issues', icon: <FiPackage />, color: 'red' },
        { id: 'payments', title: t('payments_refunds', 'Payments & Refunds'), subtitle: 'Refund status, payment failure', icon: <FiCreditCard />, color: 'blue' },
        { id: 'coupons', title: t('coupons_offers', 'Coupons & Offers'), subtitle: 'Promo codes, discount vouchers', icon: <FiTag />, color: 'green' },
        { id: 'account', title: t('account_general', 'Account & General'), subtitle: 'Address, profile settings, safety', icon: <FiUser />, color: 'purple' },
    ];

    const faqs = [
        {
            id: 1,
            category: 'orders',
            question: 'What if my order is delayed or late?',
            answer: 'We track delivery drivers in real-time. If your order exceeds the estimated delivery time by over 15 minutes, please tap "Chat with Support Bot" below for instant live tracking updates and compensation options.'
        },
        {
            id: 2,
            category: 'orders',
            question: 'I received missing or wrong items in my order. What should I do?',
            answer: 'We apologize for the inconvenience! Select your order above under "Recent Orders", choose the missing item, and submit a photo. A full refund or replacement will be processed instantly.'
        },
        {
            id: 3,
            category: 'payments',
            question: 'Where is my refund for a cancelled order?',
            answer: 'Refunds to Bitezy Wallet are instant (within 5 minutes). Refunds to original payment methods (UPI, Credit/Debit cards) take 3-5 business days to reflect in your bank account.'
        },
        {
            id: 4,
            category: 'payments',
            question: 'My payment was deducted but my order was not placed.',
            answer: 'Don\'t worry! Unconfirmed payments are automatically refunded by your bank within 2-4 hours. You can verify your transaction status in your Bitezy Wallet page.'
        },
        {
            id: 5,
            category: 'coupons',
            question: 'Why is my coupon code not applying?',
            answer: 'Ensure your order meets the minimum subtotal requirement (excluding taxes and delivery fees) and that the voucher hasn\'t expired or already been redeemed on your account.'
        },
        {
            id: 6,
            category: 'account',
            question: 'How do I change my default delivery address?',
            answer: 'You can manage and set default saved addresses by going to Profile Hub → Saved Address.'
        }
    ];

    const toggleFaq = (id) => {
        setExpandedFaq(prev => prev === id ? null : id);
    };

    const filteredFaqs = faqs.filter(faq => {
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

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
            <div className="help-support-page">
                {/* Hero Search Section */}
                <section className="help-hero">
                    <div className="help-hero-overlay"></div>
                    <div className="help-hero-inner">
                        <button className="help-back-btn" onClick={handleBack} aria-label="Go Back">
                            <FiArrowLeft /> Back to Profile
                        </button>
                        <div className="help-title-block">
                            <h1>How can we help you today?</h1>
                            <p>Search help topics or select an issue below</p>
                        </div>
                        <div className="help-search-box">
                            <FiSearch className="help-search-icon" />
                            <input 
                                type="text" 
                                placeholder="Search for questions, order issues, or refunds..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                <div className="help-container">
                    {/* Recent Orders Quick Help Card */}
                    {recentOrders.length > 0 && (
                        <div className="recent-orders-card">
                            <div className="recent-orders-header">
                                <h3><FiClock /> Need help with a recent order?</h3>
                                <span className="order-subtitle">Select order to report an issue</span>
                            </div>
                            <div className="order-help-items-grid">
                                {recentOrders.map(ord => (
                                    <div 
                                        key={ord.id || ord.transaction_id} 
                                        className="order-help-item-pill"
                                        onClick={() => navigate(`/live-chat`, { state: { orderId: ord.id || ord.transaction_id } })}
                                    >
                                        <div className="order-item-left">
                                            <span className="order-item-title">Order #{ord.id || ord.transaction_id}</span>
                                            <span className="order-item-status">₹{ord.totalAmount || ord.total_amount || 0} • {ord.status || 'Delivered'}</span>
                                        </div>
                                        <FiChevronRight className="order-item-arrow" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Category Selection Grid */}
                    <div className="help-category-grid">
                        {categories.map(cat => (
                            <div 
                                key={cat.id}
                                className={`help-category-card ${selectedCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(prev => prev === cat.id ? 'all' : cat.id)}
                            >
                                <div className={`cat-icon-badge ${cat.color}`}>
                                    {cat.icon}
                                </div>
                                <div className="cat-details">
                                    <h4>{cat.title}</h4>
                                    <p>{cat.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* FAQ Accordion Section */}
                    <div className="faq-section">
                        <div className="faq-section-header">
                            <h3>Frequently Asked Questions</h3>
                            <span className="faq-count-badge">{filteredFaqs.length} Answers</span>
                        </div>
                        <div className="faq-list">
                            {filteredFaqs.length === 0 ? (
                                <p style={{ color: '#64748b', fontSize: '13px', padding: '10px 0' }}>No matching help topics found for "{searchQuery}". Try asking our support bot below.</p>
                            ) : (
                                filteredFaqs.map(faq => (
                                    <div key={faq.id} className={`faq-item ${expandedFaq === faq.id ? 'open' : ''}`}>
                                        <button className="faq-question-btn" onClick={() => toggleFaq(faq.id)}>
                                            <span>{faq.question}</span>
                                            <FiChevronDown className="faq-chevron" />
                                        </button>
                                        {expandedFaq === faq.id && (
                                            <div className="faq-answer-content">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Contact Support Escalation Card */}
                    <div className="contact-escalation-card">
                        <div className="contact-left">
                            <h3>Still need help?</h3>
                            <p>Connect with our customer care assistant or team 24/7</p>
                        </div>
                        <div className="contact-actions-row">
                            <button 
                                className="contact-btn primary"
                                onClick={() => navigate('/live-chat')}
                            >
                                <FiMessageSquare /> Chat with Support Bot
                            </button>
                            <a href="tel:18003663837" className="contact-btn secondary">
                                <FiPhoneCall /> Call Support
                            </a>
                            <a href="mailto:support@foodverse.com" className="contact-btn secondary">
                                <FiMail /> Email Us
                            </a>
                        </div>
                    </div>
                </div>

                <FloatingMap />
            </div>
        </>
    );
};

export default HelpSupport;
