import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../User/Navbar";
import "../UserCss/MyOrders.css";
import { FiCalendar, FiPackage, FiClock, FiCheckCircle, FiXCircle, FiTruck, FiMapPin  } from "react-icons/fi";
import { API_BASE_URL } from "../../api/api";
import NoOrdersImg from "../../assets/images/no-orders.png";
import { useTranslation } from "react-i18next";

const MyOrders = ({ isProfile = false }) => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [ratedOrders, setRatedOrders] = useState(() => JSON.parse(localStorage.getItem('ratedOrders') || '[]'));
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrders(res.data.reverse());
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    const submitReview = async (e) => {
        e.preventDefault();

        try {
            await axios.post(`${API_BASE_URL}/reviews/add?restaurantId=${selectedOrderForReview.restaurantId}`,
                { rating: reviewData.rating, comment: reviewData.comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(t("review_submitted"));
            setShowReviewModal(false);
            setReviewData({ rating: 5, comment: "" });
            
            const orderId = selectedOrderForReview.id || selectedOrderForReview.transaction_id;
            const updatedRated = [...ratedOrders, orderId];
            setRatedOrders(updatedRated);
            localStorage.setItem('ratedOrders', JSON.stringify(updatedRated));
        } catch (err) {
            alert(t("review_failed"));
        }
    };

    const handleCancelOrder = async (orderId, hasPartner) => {
        const confirmMsg = hasPartner 
            ? t("cancel_fee_warning") 
            : t("cancel_confirm_msg");
            
        if (!window.confirm(confirmMsg)) return;

        try {
            await axios.put(`${API_BASE_URL}/orders/${orderId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(t("order_cancelled_success"));
            // Refresh orders
            const res = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(res.data.reverse());
        } catch (err) {
            console.error("Error cancelling order:", err);
            alert(err.response?.data?.message || t("cancel_failed"));
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <FiClock />;
            case 'placed': return <FiPackage />;
            case 'delivered': return <FiCheckCircle />;
            case 'cancelled': return <FiXCircle />;
            default: return <FiTruck />;
        }
    };

    if (loading) return (
        <>
            {!isProfile && <Navbar />}
            <div className={`order-loader ${isProfile ? 'profile-view' : ''}`}>
                <div className="spinner"></div>
                {t("fetching_orders")}
            </div>
        </>
    );

    return (
        <div className={`my-orders-page-wrapper ${isProfile ? 'profile-view' : ''}`}>
            {!isProfile && <Navbar />}
            <div className={`orders-page-container ${isProfile ? 'profile-view' : ''}`}>
                <h1 className={`orders-title ${isProfile ? 'profile-view' : ''}`} >{t("my_orders")}</h1>

                {orders.length === 0 ? (
                    <div className="no-orders-container">
                        <img
                            src={NoOrdersImg}
                            alt={t("no_orders")}
                            className="no-orders-img"
                        />
                        <h2 className="no-orders-title">{t("no_orders")}</h2>
                        <p className="no-orders-text">{t("no_orders_msg")}</p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order, index) => (
                            <div 
                                key={order.id || `order-${index}`} 
                                className="order-card clickable-card" 
                                style={{ animationDelay: `${index * 0.1}s`, cursor: 'pointer' }}
                                onClick={() => navigate(`/order-summary/${order.id || order.transaction_id}`)}
                            >
                                <div className="order-header">
                                    <div className="order-meta">
                                        <h3 className="order-restaurant-name">{order.restaurantName}</h3>
                                        <span className="order-id">{t("order_id")}: {order.transaction_id}</span>
                                        <span className="order-date">
                                            <FiCalendar />
                                            {new Date(order.createdAt || Date.now()).toLocaleString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </span>
                                        <span className="order-address">
                                            <FiMapPin /> {order.deliveryAddress}
                                        </span>
                                    </div>
                                    <span className={`order-status status-${(order.status || 'pending').toLowerCase()}`}>
                                        {getStatusIcon(order.status)}
                                        {t((order.status || 'pending').toLowerCase())}
                                    </span>
                                </div>

                                <div className="order-items-summary">
                                    {order.items?.map((orderItem, idx) => (
                                        <div key={idx} className="order-item-row">
                                            <div className="order-item-detail-group">
                                                {orderItem.imageUrl && (
                                                    <img src={orderItem.imageUrl} alt={orderItem.itemName} className="order-item-img" />
                                                )}
                                                <div className="order-item-text">
                                                    <span className="item-name">{orderItem.itemName}</span>
                                                    <span className="order-item-qty"> × {orderItem.quantity}</span>
                                                </div>
                                            </div>
                                            <span className="item-price1">₹{orderItem.price * orderItem.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-footer">
                                    <div className="order-price-info">
                                        <span className="order-total-label">{t("amount_paid")} :</span>
                                        <span className="order-total-amount " style={{ "marginLeft": "5px" }}>₹{order.totalAmount}</span>
                                    </div>
                                    <div className="order-actions-row">
                                        {['placed', 'accepted', 'preparing', 'paid'].includes(order.status?.toLowerCase()) && (
                                            <button className="cancel-order-btn" onClick={(e) => {
                                                e.stopPropagation();
                                                handleCancelOrder(order.id, !!order.deliveryPartnerName);
                                            }}>
                                                {t("cancel_order")}
                                            </button>
                                        )}
                                        {order.status?.toLowerCase() === 'delivered' && !ratedOrders.includes(order.id || order.transaction_id) && (
                                            <button className="rate-order-btn" onClick={(e) => {
                                                e.stopPropagation(); // Prevent navigating to summary
                                                setSelectedOrderForReview(order);
                                                setShowReviewModal(true);
                                            }}>
                                                {t("rate_order")}
                                            </button>
                                        )}
                                    </div>
                                    {order.deliveryPartnerName && !['delivered', 'cancelled'].includes(order.status?.toLowerCase()) && (
                                        <div className="delivery-info-card">
                                            <div className="dp-profile-group">
                                                <div className="dp-avatar">
                                                    {order.deliveryPartnerName.charAt(0)}
                                                </div>
                                                <div className="dp-main-info">
                                                    <span className="dp-label">{t("assigned_partner")}</span>
                                                    <span className="dp-name">{order.deliveryPartnerName}</span>
                                                </div>
                                            </div>
                                            <a href={`tel:${order.deliveryPartnerPhone}`} className="dp-call-btn" onClick={(e) => e.stopPropagation()}>
                                                <FiTruck /> <span>{t("call_partner")}</span>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Review Modal */}
                {showReviewModal && (
                    <div className="review-modal-overlay">
                        <div className="review-modal">
                            <h2>{t("rate_your_order")} {selectedOrderForReview?.restaurantName}</h2>
                            <form onSubmit={submitReview}>
                                <div className="rating-input-group">
                                    <label>{t("rating_label")}</label>
                                    <select
                                        value={reviewData.rating}
                                        onChange={(e) => setReviewData({ ...reviewData, rating: parseInt(e.target.value) })}
                                    >
                                        <option value="5">⭐⭐⭐⭐⭐ ({t("excellent")})</option>
                                        <option value="4">⭐⭐⭐⭐ ({t("good")})</option>
                                        <option value="3">⭐⭐⭐ ({t("average")})</option>
                                        <option value="2">⭐⭐ ({t("poor")})</option>
                                        <option value="1">⭐ ({t("terrible")})</option>
                                    </select>
                                </div>
                                <div className="comment-input-group">
                                    <label>{t("feedback_label")}</label>
                                    <textarea
                                        value={reviewData.comment}
                                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                        placeholder={t("feedback_placeholder")}
                                        rows="4"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="submit" className="submit-review-btn">{t("submit_review")}</button>
                                    <button type="button" className="close-modal-btn" onClick={() => setShowReviewModal(false)}>{t("cancel")}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Order Summary Modal removed - now opens in new tab */}
            </div>
        </div>
    );
};

export default MyOrders;
