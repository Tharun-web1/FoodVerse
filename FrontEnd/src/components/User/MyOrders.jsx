import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../User/Navbar";
import "../UserCss/MyOrders.css";
import { FiCalendar, FiPackage, FiClock, FiCheckCircle, FiXCircle, FiTruck, FiMapPin, FiArrowLeft, FiMoreVertical, FiChevronRight, FiRefreshCw, FiFileText, FiTrash2, FiStar, FiX } from "react-icons/fi";
import { API_BASE_URL } from "../../api/api";
import NoOrdersImg from "../../assets/images/no-orders.png";
import { useTranslation } from "react-i18next";
import { useCart } from "./CartContext";

const MyOrders = ({ isProfile = false }) => {
    const { t } = useTranslation();
    const { addToCart } = useCart();
    const [orders, setOrders] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [ratedOrders, setRatedOrders] = useState(() => JSON.parse(localStorage.getItem('ratedOrders') || '[]'));
    const [activeDropdownOrderId, setActiveDropdownOrderId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: "", deliveryRating: 5 });
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        const handleOutsideClick = () => setActiveDropdownOrderId(null);
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, []);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/restaurants`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRestaurants(res.data);
            } catch (err) {
                console.error("Error fetching restaurants for orders", err);
            }
        };
        if (token) {
            fetchRestaurants();
        }

        const fetchOrders = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const deletedIds = JSON.parse(localStorage.getItem('deletedOrderIds') || '[]');
                const activeOrders = res.data.reverse().filter(o => !deletedIds.includes(o.id || o.transaction_id));
                setOrders(activeOrders);
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
            let url = `${API_BASE_URL}/reviews/add?restaurantId=${selectedOrderForReview.restaurantId}`;
            if (selectedOrderForReview.deliveryPartnerId) {
                url += `&deliveryPartnerId=${selectedOrderForReview.deliveryPartnerId}&deliveryRating=${reviewData.deliveryRating}`;
            }

            await axios.post(url,
                { rating: reviewData.rating, comment: reviewData.comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(t("review_submitted"));
            setShowReviewModal(false);
            setReviewData({ rating: 5, comment: "", deliveryRating: 5 });

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

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(err => console.log("Backend delete endpoint optional", err));

            const deletedIds = JSON.parse(localStorage.getItem('deletedOrderIds') || '[]');
            if (!deletedIds.includes(orderId)) {
                const updated = [...deletedIds, orderId];
                localStorage.setItem('deletedOrderIds', JSON.stringify(updated));
            }

            setOrders(prev => prev.filter(o => (o.id || o.transaction_id) !== orderId));
        } catch (err) {
            console.error("Error deleting order:", err);
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

    const getArea = (address) => {
        if (!address) return "";
        const parts = address.split(',').map(p => p.trim());
        const skipKeywords = ['floor', 'level', 'unit', 'flat', 'house', 'no.', 'building', 'tower', 'next to', 'opposite'];
        const area = parts.find(p => {
            const lower = p.toLowerCase();
            return !skipKeywords.some(k => lower.includes(k)) && !/^\d+$/.test(p);
        });
        return area || parts[0];
    };

    const isItemVeg = (orderItem) => {
        if (orderItem.type) {
            return orderItem.type.toLowerCase() === 'veg';
        }
        const name = (orderItem.itemName || "").toLowerCase();
        const nonVegKeywords = [
            'chicken', 'mutton', 'fish', 'prawn', 'crab', 'egg', 'kabab', 'kebab', 
            'meat', 'pork', 'beef', 'non-veg', 'non veg', 'tikka', 'butter chicken'
        ];
        const vegOverrides = ['veg', 'mushroom', 'paneer', 'gobi', 'aloo', 'onion', 'cheese', 'dal', 'roti', 'rice'];
        const hasVegOverride = vegOverrides.some(word => name.includes(word));
        if (hasVegOverride) {
            const hasNonVeg = nonVegKeywords.filter(w => w !== 'egg').some(word => name.includes(word));
            if (!hasNonVeg) return true;
        }
        return !nonVegKeywords.some(keyword => name.includes(keyword));
    };

    const renderVegNonVegIcon = (orderItem) => {
        const isVeg = isItemVeg(orderItem);
        return (
            <div className={`veg-nonveg-badge ${isVeg ? 'veg' : 'non-veg'}`}>
                <span className="dot"></span>
            </div>
        );
    };

    const handleReorder = (order) => {
        if (!order || !order.items) return;
        order.items.forEach(item => {
            addToCart({
                id: item.id || item.itemId,
                name: item.itemName,
                price: item.price,
                available: true
            }, order.restaurantId, item.quantity);
        });
        navigate(`/cart?resId=${order.restaurantId}`);
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
                <div className="orders-header-row-v3">
                    <button className="back-btn-orders-v3" onClick={() => navigate("/profile")} aria-label="Go Back">
                        <FiArrowLeft />
                    </button>
                    <h1 className={`orders-title ${isProfile ? 'profile-view' : ''}`} >{t("my_orders")}</h1>
                </div>

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
                        {orders.map((order, index) => {
                            const resInfo = restaurants.find(r => r.id === order.restaurantId);
                            const resImage = resInfo ? `${API_BASE_URL}/restaurants/${order.restaurantId}/image` : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400";
                            const resAddress = resInfo ? resInfo.address : order.deliveryAddress;
                            const isResActive = resInfo ? resInfo.active : true;
                            
                            const formattedDate = new Date(order.createdAt || Date.now()).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            }).replace(/am/i, 'AM').replace(/pm/i, 'PM');

                            return (
                                <div
                                    key={order.id || `order-${index}`}
                                    className="order-card-v4"
                                    onClick={() => navigate(`/order-summary/${order.id || order.transaction_id}`)}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    {/* 1. Header Row */}
                                    <div className="order-card-header">
                                        <div className="order-restaurant-info">
                                            <img 
                                                src={resImage} 
                                                alt={order.restaurantName} 
                                                className="order-res-thumb" 
                                                onError={(e) => {
                                                    e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400";
                                                }}
                                            />
                                            <div className="order-res-text">
                                                <h3 className="order-res-name">{order.restaurantName}</h3>
                                                <span className="order-res-location">{getArea(resAddress)}</span>
                                                <span 
                                                    className="order-view-menu-link" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/restaurant/${order.restaurantId}`);
                                                    }}
                                                >
                                                    {t("view_menu")} <span className="arrow">▸</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="order-options-container">
                                            <div 
                                                className="order-options-btn" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const orderId = order.id || order.transaction_id;
                                                    setActiveDropdownOrderId(prev => prev === orderId ? null : orderId);
                                                }}
                                                title="Order Options"
                                                aria-label="Order Options"
                                            >
                                                <FiMoreVertical />
                                            </div>
                                            {activeDropdownOrderId === (order.id || order.transaction_id) && (
                                                <div className="order-dropdown-menu animate__animated animate__fadeIn animate__faster">
                                                    <button 
                                                        className="dropdown-item" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveDropdownOrderId(null);
                                                            navigate(`/order-summary/${order.id || order.transaction_id}`);
                                                        }}
                                                    >
                                                        <FiFileText /> {t("order_details", "Order Details")}
                                                    </button>
                                                    {['delivered', 'cancelled', 'refunded', 'failed'].includes((order.status || '').toLowerCase()) && (
                                                        <button 
                                                            className="dropdown-item delete-item" 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveDropdownOrderId(null);
                                                                handleDeleteOrder(order.id || order.transaction_id);
                                                            }}
                                                        >
                                                            <FiTrash2 /> {t("delete_order", "Delete Order")}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 2. Items List Row */}
                                    <div className="order-card-items">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="order-card-item-row">
                                                <div className="order-item-header">
                                                    {renderVegNonVegIcon(item)}
                                                    <span className="order-item-qty-name">{item.quantity} x {item.itemName}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 3. Receipt/Order Details Row */}
                                    <div className="order-card-meta">
                                        <div className="order-meta-left">
                                            <span className="order-placed-time">{t("order_placed_on")} {formattedDate}</span>
                                            <span className={`order-status-text ${(order.status || 'pending').toLowerCase()}`}>
                                                {t((order.status || 'pending').toLowerCase())}
                                            </span>
                                        </div>
                                        <div className="order-meta-right">
                                            <span className="order-price-val">₹{order.totalAmount}</span>
                                            <FiChevronRight className="chevron-right-icon" />
                                        </div>
                                    </div>

                                    {/* 4. Action Button Row */}
                                    <div className="order-card-actions">
                                        {/* Original features like cancel or rate aligned alongside reorder */}
                                        <div className="secondary-actions">
                                            {['placed', 'accepted', 'preparing', 'paid'].includes(order.status?.toLowerCase()) && (
                                                <button 
                                                    className="cancel-btn-v4" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancelOrder(order.id, !!order.deliveryPartnerName);
                                                    }}
                                                >
                                                    {t("cancel_order")}
                                                </button>
                                            )}
                                            {order.status?.toLowerCase() === 'delivered' && !ratedOrders.includes(order.id || order.transaction_id) && (
                                                <button 
                                                    className="rate-btn-v4" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedOrderForReview(order);
                                                        setShowReviewModal(true);
                                                    }}
                                                >
                                                    {t("rate_order")}
                                                </button>
                                            )}
                                        </div>

                                        <div className="primary-action">
                                            {isResActive ? (
                                                <button 
                                                    className="reorder-btn-v4" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleReorder(order);
                                                    }}
                                                >
                                                    <FiRefreshCw className="reorder-icon-v4" /> {t("reorder")}
                                                </button>
                                            ) : (
                                                <button className="disabled-delivery-btn" disabled onClick={(e) => e.stopPropagation()}>
                                                    {t("currently_not_delivering")}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Delivery Partner Details if active */}
                                    {order.deliveryPartnerName && !['delivered', 'cancelled'].includes(order.status?.toLowerCase()) && (
                                        <div className="delivery-info-card-v4" onClick={(e) => e.stopPropagation()}>
                                            <div className="dp-profile-group">
                                                <div className="dp-avatar">
                                                    {order.deliveryPartnerName.charAt(0)}
                                                </div>
                                                <div className="dp-main-info">
                                                    <span className="dp-label">{t("assigned_partner")}</span>
                                                    <span className="dp-name">{order.deliveryPartnerName}</span>
                                                </div>
                                            </div>
                                            <a href={`tel:${order.deliveryPartnerPhone}`} className="dp-call-btn-v4">
                                                <FiTruck /> <span>{t("call_partner")}</span>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Review Modal V4 */}
                {showReviewModal && (
                    <div className="review-modal-overlay animate__animated animate__fadeIn">
                        <div className="review-modal-v4 animate__animated animate__zoomIn">
                            {/* Modal Header */}
                            <div className="review-modal-header">
                                <div className="modal-header-text">
                                    <h3>{t("rate_your_order", "Rate Your Order")}</h3>
                                    <p className="order-target-name">{selectedOrderForReview?.restaurantName}</p>
                                </div>
                                <button className="review-modal-close" onClick={() => setShowReviewModal(false)}>
                                    <FiX />
                                </button>
                            </div>

                            <form onSubmit={submitReview} className="review-form-body">
                                {/* Section 1: Restaurant Rating */}
                                <div className="rating-section-card">
                                    <div className="rating-section-title">
                                        <span>🍲 {t("restaurant_rating", "Food & Taste Quality")}</span>
                                    </div>
                                    <div className="stars-interactive-wrapper">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                type="button"
                                                key={star}
                                                className={`star-btn ${star <= reviewData.rating ? 'active' : ''}`}
                                                onClick={() => setReviewData({ ...reviewData, rating: star })}
                                            >
                                                <FiStar className="star-icon" />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="rating-label-pill">
                                        {reviewData.rating === 5 && "⭐ Excellent! (5.0)"}
                                        {reviewData.rating === 4 && "👍 Good (4.0)"}
                                        {reviewData.rating === 3 && "😐 Average (3.0)"}
                                        {reviewData.rating === 2 && "👎 Poor (2.0)"}
                                        {reviewData.rating === 1 && "😡 Terrible (1.0)"}
                                    </div>

                                    {/* Quick Feedback Chips */}
                                    <div className="quick-tags-container">
                                        {[
                                            "😋 Delicious Food",
                                            "📦 Great Packaging",
                                            "🔥 Hot & Fresh",
                                            "💰 Worth The Money",
                                            "🍱 Generous Portion"
                                        ].map((tag) => (
                                            <button
                                                type="button"
                                                key={tag}
                                                className={`quick-tag-chip ${reviewData.comment.includes(tag) ? 'selected' : ''}`}
                                                onClick={() => {
                                                    if (reviewData.comment.includes(tag)) {
                                                        setReviewData({ ...reviewData, comment: reviewData.comment.replace(tag, "").trim() });
                                                    } else {
                                                        setReviewData({ ...reviewData, comment: (reviewData.comment ? `${reviewData.comment} • ${tag}` : tag) });
                                                    }
                                                }}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="comment-input-group">
                                        <textarea
                                            value={reviewData.comment}
                                            onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                            placeholder={t("feedback_placeholder", "Write detailed feedback about food quality, taste, packaging...")}
                                            rows="3"
                                        />
                                    </div>
                                </div>

                                {/* Section 2: Delivery Partner Rating */}
                                {selectedOrderForReview?.deliveryPartnerName && (
                                    <div className="rating-section-card dp-card">
                                        <div className="rating-section-title">
                                            <span>🛵 {t("delivery_partner_rating", "Delivery Partner")} ({selectedOrderForReview.deliveryPartnerName})</span>
                                        </div>
                                        <div className="stars-interactive-wrapper">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    type="button"
                                                    key={star}
                                                    className={`star-btn ${star <= (reviewData.deliveryRating || 5) ? 'active' : ''}`}
                                                    onClick={() => setReviewData({ ...reviewData, deliveryRating: star })}
                                                >
                                                    <FiStar className="star-icon" />
                                                </button>
                                            ))}
                                        </div>
                                        <div className="rating-label-pill">
                                            {(reviewData.deliveryRating || 5) === 5 && "⚡ Super Fast & Friendly! (5.0)"}
                                            {(reviewData.deliveryRating || 5) === 4 && "👍 Good Service (4.0)"}
                                            {(reviewData.deliveryRating || 5) === 3 && "😐 Average (3.0)"}
                                            {(reviewData.deliveryRating || 5) === 2 && "👎 Delayed / Rude (2.0)"}
                                            {(reviewData.deliveryRating || 5) === 1 && "😡 Poor Handling (1.0)"}
                                        </div>
                                    </div>
                                )}

                                {/* Modal Actions */}
                                <div className="review-modal-footer">
                                    <button type="button" className="close-modal-btn-v4" onClick={() => setShowReviewModal(false)}>
                                        {t("cancel", "Cancel")}
                                    </button>
                                    <button type="submit" className="submit-review-btn-v4">
                                        {t("submit_review", "Submit Review")}
                                    </button>
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
