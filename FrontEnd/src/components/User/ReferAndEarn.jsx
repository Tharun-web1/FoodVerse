import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import FloatingMap from './FloatingMap';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { FiArrowLeft, FiCopy, FiGift, FiShare2, FiShoppingBag, FiCheck, FiUsers, FiAward, FiUserCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import '../UserCss/ReferAndEarn.css';

const ReferAndEarn = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [copied, setCopied] = useState(false);
    const [referralData, setReferralData] = useState({
        referralCode: '',
        totalEarned: 0,
        successfulReferredCount: 0,
        totalFriendsReferred: 0,
        referredFriends: []
    });

    const getCleanText = (key, fallback) => {
        const val = t(key);
        if (!val || val === key || val.includes('_')) return fallback;
        return val;
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const fallbackCode = user.username ? `${user.username.toUpperCase().replace(/\s+/g, '')}100` : 'FOODVERSE100';
    const refCode = referralData.referralCode || fallbackCode;

    useEffect(() => {
        const fetchReferralInfo = async () => {
            try {
                const res = await api.get('/users/referral-info');
                if (res.data) {
                    setReferralData(res.data);
                }
            } catch (err) {
                console.error("Error fetching referral info:", err);
            }
        };
        fetchReferralInfo();
    }, []);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(refCode);
        setCopied(true);
        showToast("Referral code copied to clipboard!", "success");
        setTimeout(() => setCopied(false), 3000);
    };

    const handleShareWhatsApp = () => {
        const shareText = `Hey! Use my referral code ${refCode} to get up to ₹100 cashback on your first food order at FoodVerse! 🍔 Order now: ${window.location.origin}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    };

    const handleNativeShare = async () => {
        const shareData = {
            title: 'FoodVerse Referral Rewards',
            text: `Use my referral code ${refCode} to get up to ₹100 cashback on your first order!`,
            url: window.location.origin,
        };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log("Error sharing:", err);
            }
        } else {
            handleCopyCode();
        }
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
            <div className="refer-earn-page">
                <div className="refer-earn-container">
                    <header className="page-header-v3">
                        <div className="header-main-row">
                            <button className="back-btn-v3" onClick={handleBack} type="button" aria-label="Go Back">
                                <FiArrowLeft />
                            </button>
                            <h1 className="page-title">{getCleanText("refer_and_earn", "Refer & Earn")}</h1>
                        </div>
                        <p className="page-subtitle">Invite your friends and earn rewards on every order</p>
                    </header>

                    {/* HERO CARDS BANNER */}
                    <div className="refer-hero-card animate__animated animate__fadeIn">
                        <div className="hero-content">
                            <span className="hero-tag">EXCLUSIVE REWARDS</span>
                            <h2>Invite Friends, Get Up to ₹100 Food Cash! 🎁</h2>
                            <p>Share your unique referral code with your friends. When they place their first order, you both get up to ₹100 instantly in your Bitezy Wallet.</p>
                        </div>
                        <div className="hero-illustration">
                            <div className="gift-badge-circle">
                                <FiGift />
                            </div>
                        </div>
                    </div>

                    {/* REFERRAL CODE SECTION */}
                    <div className="referral-box-card">
                        <span className="box-label">YOUR UNIQUE REFERRAL CODE</span>
                        <div className="code-display-row">
                            <div className="code-badge">{refCode}</div>
                            <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopyCode}>
                                {copied ? <><FiCheck /> COPIED</> : <><FiCopy /> COPY CODE</>}
                            </button>
                        </div>

                        <div className="share-actions-row">
                            <button className="whatsapp-btn" onClick={handleShareWhatsApp}>
                                <FaWhatsapp className="whatsapp-icon" /> Share on WhatsApp
                            </button>
                            <button className="share-link-btn" onClick={handleNativeShare}>
                                <FiShare2 /> Share Link
                            </button>
                        </div>
                    </div>

                    {/* HOW IT WORKS SECTION */}
                    <div className="how-it-works-section">
                        <h3 className="section-title">How It Works</h3>
                        <div className="steps-grid">
                            <div className="step-card">
                                <div className="step-number">1</div>
                                <div className="step-icon-circle"><FiShare2 /></div>
                                <h4>Share Code</h4>
                                <p>Send your referral code or link to your friends via WhatsApp or social apps.</p>
                            </div>

                            <div className="step-card">
                                <div className="step-number">2</div>
                                <div className="step-icon-circle"><FiShoppingBag /></div>
                                <h4>First Order</h4>
                                <p>Your friend signs up using your code and completes their very first meal order.</p>
                            </div>

                            <div className="step-card">
                                <div className="step-number">3</div>
                                <div className="step-icon-circle"><FiGift /></div>
                                <h4>Earn Up to ₹100 Each</h4>
                                <p>Cashback is credited directly to both of your Bitezy wallets automatically!</p>
                            </div>
                        </div>
                    </div>

                    {/* REWARDS STATS CARD */}
                    <div className="rewards-summary-card">
                        <h3 className="card-title">Your Referral Stats</h3>
                        <div className="stats-row">
                            <div className="stat-box">
                                <div className="stat-icon-wrapper blue"><FiAward /></div>
                                <div className="stat-info">
                                    <span className="stat-val">₹{referralData.totalEarned || 0}</span>
                                    <span className="stat-lbl">Total Cash Earned</span>
                                </div>
                            </div>

                            <div className="stat-box">
                                <div className="stat-icon-wrapper green"><FiUsers /></div>
                                <div className="stat-info">
                                    <span className="stat-val">{referralData.successfulReferredCount || 0} Friends</span>
                                    <span className="stat-lbl">Rewards Claimed</span>
                                </div>
                            </div>
                        </div>

                        {/* REFERRED FRIENDS LIST */}
                        {referralData.referredFriends && referralData.referredFriends.length > 0 && (
                            <div className="mt-4 pt-3 border-top">
                                <h5 className="fw-bold mb-3 text-dark small text-uppercase tracking-wider">
                                    Referred Friends ({referralData.referredFriends.length})
                                </h5>
                                <div className="referred-friends-list">
                                    {referralData.referredFriends.map((friend, idx) => (
                                        <div key={idx} className="d-flex align-items-center justify-content-between p-2 mb-2 rounded bg-light">
                                            <div className="d-flex align-items-center gap-2">
                                                <FiUserCheck className="text-primary" />
                                                <span className="fw-semibold small">{friend.username}</span>
                                            </div>
                                            {friend.claimed ? (
                                                <span className="badge bg-success-subtle text-success border border-success-subtle">
                                                    +₹{friend.rewardAmount} Cashback Earned
                                                </span>
                                            ) : (
                                                <span className="badge bg-warning-subtle text-warning border border-warning-subtle">
                                                    Pending 1st Order
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <FloatingMap />
        </>
    );
};

export default ReferAndEarn;
