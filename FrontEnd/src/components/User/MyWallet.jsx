import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiArrowDownLeft, FiArrowUpRight, FiPlusCircle, FiSmartphone } from 'react-icons/fi';
import { API_BASE_URL } from '../../api/api';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import "../UserCss/MyWallet.css";
import "../UserCss/MyAddress.css";
import "../../components/UserCss/MyProfilePage.css";

const MyWallet = ({ isProfile = false }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { token } = useAuth();
    const { showToast } = useToast();
    const [balance, setBalance] = useState(0);
    const [email, setEmail] = useState('');
    const [addAmount, setAddAmount] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchWalletData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const profileRes = await axios.get(`${API_BASE_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const userEmail = profileRes.data.mail;
            setEmail(userEmail);
            setBalance(profileRes.data.walletBalance || 0);

            let orderTransactions = [];
            try {
                const ordersRes = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const orders = ordersRes.data || [];
                
                orders.forEach(order => {
                    const walletDeducted = order.walletAmountDeducted || 0;
                    if (walletDeducted > 0) {
                        const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED" || order.status === "FAILED";
                        if (isCancelled) {
                            orderTransactions.push({
                                id: `refund-${order.id || order.transaction_id}`,
                                type: 'credit',
                                amount: walletDeducted,
                                description: `${t('wallet_refund', 'Refund for Order')} #${order.id || order.transaction_id}`,
                                date: order.createdAt || new Date().toISOString()
                            });
                        } else {
                            orderTransactions.push({
                                id: `payment-${order.id || order.transaction_id}`,
                                type: 'debit',
                                amount: walletDeducted,
                                description: `${t('wallet_payment', 'Payment for Order')} #${order.id || order.transaction_id}`,
                                date: order.createdAt || new Date().toISOString()
                            });
                        }
                    }
                });
            } catch (err) {
                console.error("Error loading order transactions:", err);
            }

            const localKey = `walletTransactions_${userEmail}`;
            const localTransactions = JSON.parse(localStorage.getItem(localKey) || "[]");

            const combined = [...orderTransactions, ...localTransactions].sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            );
            setTransactions(combined);
        } catch (err) {
            console.error("Error fetching wallet info:", err);
            showToast("Failed to load wallet details", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, [token]);

    const handleAddMoney = async (e) => {
        e?.preventDefault();
        const numericAmount = parseFloat(addAmount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            showToast("Please enter a valid positive amount", "warning");
            return;
        }

        setSubmitting(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/users/wallet/add`, { amount: numericAmount }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const newBalance = res.data;
            setBalance(newBalance);
            showToast(`Added ₹${numericAmount.toFixed(2)} to wallet!`, "success");

            const localKey = `walletTransactions_${email}`;
            const localTransactions = JSON.parse(localStorage.getItem(localKey) || "[]");
            const newTx = {
                id: `deposit-${Date.now()}`,
                type: 'credit',
                amount: numericAmount,
                description: t('wallet_added', 'Added money to wallet'),
                date: new Date().toISOString()
            };
            const updatedTxList = [newTx, ...localTransactions];
            localStorage.setItem(localKey, JSON.stringify(updatedTxList));

            setTransactions(prev => [newTx, ...prev]);
            setAddAmount('');
        } catch (err) {
            console.error("Error adding wallet money:", err);
            showToast("Failed to add money. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuickSelect = (amount) => {
        setAddAmount(amount.toString());
    };

    const formatDate = (isoString) => {
        try {
            const d = new Date(isoString);
            return d.toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return isoString;
        }
    };

    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/profile', { state: { openProfileSidebar: true } });
        }
    };

    if (loading) {
        return (
            <div className={`wallet-page-wrapper ${isProfile ? 'profile-view' : ''}`}>
                {!isProfile && <Navbar />}
                <div className="wallet-page-container">
                    <div className="sticky-wishlist-header">
                        <button className="back-btn-v3" onClick={handleBack} type="button" aria-label="Go Back">
                            <FiArrowLeft />
                        </button>
                        <h1 className="page-title">{t("bitezy_wallet", "Bitezy Wallet")}</h1>
                    </div>
                    <div className="loader" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>{t("loading_wallet", "Loading Wallet Details...")}</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`wallet-page-wrapper ${isProfile ? 'profile-view' : ''}`}>
            {!isProfile && <Navbar />}
            <div className="wallet-page-container">
                <div className="sticky-wishlist-header">
                    <button className="back-btn-v3" onClick={handleBack} type="button" aria-label="Go Back">
                        <FiArrowLeft />
                    </button>
                    <h1 className="page-title">{t("bitezy_wallet", "Bitezy Wallet")}</h1>
                </div>

                <div className="wallet-layout-container">
                    <div className="wallet-card-widget">
                        <div className="wallet-card-overlay"></div>
                        <div className="wallet-card-top">
                            <span className="wallet-card-brand">Bitezy Pay</span>
                            <FiSmartphone className="wallet-card-icon" />
                        </div>
                        <div className="wallet-card-middle">
                            <span className="wallet-card-bal-lbl">{t("available_balance", "Available Balance")}</span>
                            <span className="wallet-card-balance">₹{balance.toFixed(2)}</span>
                        </div>
                        <div className="wallet-card-bottom">
                            <span className="wallet-card-owner">{email}</span>
                            <span className="wallet-card-chip"></span>
                        </div>
                    </div>

                    <div className="wallet-add-money-box">
                        <h3>{t("add_money", "Add Money to Wallet")}</h3>
                        <form onSubmit={handleAddMoney} className="add-money-form">
                            <div className="quick-amount-chips">
                                <button type="button" onClick={() => handleQuickSelect(100)} className="amount-chip">+ ₹100</button>
                                <button type="button" onClick={() => handleQuickSelect(200)} className="amount-chip">+ ₹200</button>
                                <button type="button" onClick={() => handleQuickSelect(500)} className="amount-chip">+ ₹500</button>
                                <button type="button" onClick={() => handleQuickSelect(1000)} className="amount-chip">+ ₹1000</button>
                            </div>
                            <div className="amount-input-group">
                                <span className="currency-prefix">₹</span>
                                <input 
                                    type="number" 
                                    min="1"
                                    step="any"
                                    placeholder={t("enter_amount", "Enter Amount")}
                                    value={addAmount}
                                    onChange={(e) => setAddAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="save-btn add-wallet-btn" disabled={submitting}>
                                {submitting ? t("adding_money", "Adding...") : (
                                    <>
                                        <FiPlusCircle style={{ marginRight: '8px', strokeWidth: '2.5' }} />
                                        {t("add_money_btn", "Add Money")}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="wallet-transactions-section">
                    <h3>{t("recent_transactions", "Recent Transactions")}</h3>
                    {transactions.length === 0 ? (
                        <div className="empty-transactions">
                            <p>{t("no_transactions", "No transactions found for this wallet yet.")}</p>
                        </div>
                    ) : (
                        <div className="transactions-list">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="transaction-item">
                                    <div className="tx-left">
                                        <div className={`tx-icon-circle ${tx.type}`}>
                                            {tx.type === 'credit' ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                                        </div>
                                        <div className="tx-info">
                                            <span className="tx-desc">{tx.description}</span>
                                            <span className="tx-date">{formatDate(tx.date)}</span>
                                        </div>
                                    </div>
                                    <div className={`tx-amount ${tx.type}`}>
                                        {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyWallet;
