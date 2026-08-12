import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiHeart, FiStar, FiZap } from 'react-icons/fi';
import { API_BASE_URL } from '../../api/api';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import "../UserCss/RestuarentCard.css";
import "../UserCss/MyWishlist.css";
import "../../components/UserCss/MyProfilePage.css";

const MyWishlist = ({ isProfile = false }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { token } = useAuth();
    const { showToast } = useToast();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/users/favorites`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const favIds = res.data.map(f => Number(f.restaurantId));

            if (favIds.length === 0) {
                setWishlist([]);
                setLoading(false);
                return;
            }

            const detailsPromises = favIds.map(id =>
                axios.get(`${API_BASE_URL}/restaurants/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then(res => res.data)
                .catch(err => {
                    console.error(`Error loading restaurant ${id} details:`, err);
                    return null;
                })
            );

            const details = await Promise.all(detailsPromises);
            setWishlist(details.filter(d => d !== null));
        } catch (err) {
            console.error('Error fetching favorites list:', err);
            showToast("Failed to load wishlist", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [token]);

    const handleRemoveFromWishlist = async (e, resId) => {
        e?.preventDefault();
        e?.stopPropagation();
        const numericId = Number(resId);
        
        setWishlist(prev => prev.filter(r => Number(r.id) !== numericId));

        try {
            await axios.post(`${API_BASE_URL}/users/favorites/toggle/${numericId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast("Removed from wishlist", "success");
        } catch (err) {
            console.error('Error toggling favorite from wishlist page:', err);
            showToast("Failed to remove restaurant", "error");
            fetchWishlist();
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
            <div className={`wishlist-page-wrapper ${isProfile ? 'profile-view' : ''}`}>
                {!isProfile && <Navbar />}
                <div className="wishlist-page-container">
                    <div className="sticky-wishlist-header">
                        <button className="back-btn-v3" onClick={handleBack} type="button" aria-label="Go Back">
                            <FiArrowLeft />
                        </button>
                        <h1 className="page-title">{t("my_wishlist", "My Wishlist")}</h1>
                    </div>
                    <div className="loader" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>{t("loading_wishlist", "Loading Wishlist...")}</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`wishlist-page-wrapper ${isProfile ? 'profile-view' : ''}`}>
            {!isProfile && <Navbar />}
            <div className="wishlist-page-container">
                <div className="sticky-wishlist-header">
                    <button className="back-btn-v3" onClick={handleBack} type="button" aria-label="Go Back">
                        <FiArrowLeft />
                    </button>
                    <h1 className="page-title">{t("my_wishlist", "My Wishlist")}</h1>
                </div>

                {wishlist.length === 0 ? (
                    <div className="wishlist-empty-state">
                        <div className="wishlist-empty-icon-circle">
                            <FiHeart />
                        </div>
                        <h2>Your wishlist is empty</h2>
                        <p>
                            Explore the best restaurants and add them to your wishlist to order from them later.
                        </p>
                        <button 
                            onClick={() => navigate("/user")} 
                            className="wishlist-browse-btn"
                        >
                            Browse Restaurants
                        </button>
                    </div>
                ) : (
                    <div className="restaurant-grid" style={{ padding: '16px 0' }}>
                        {wishlist.map((r) => (
                            <div
                                key={r.id}
                                className="restaurant-card-v2 animate__animated animate__fadeInUp"
                                onClick={() => navigate(`/restaurant/${r.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="res-img-container-v2">
                                    <img
                                        src={`${API_BASE_URL}/restaurants/${r.id}/image`}
                                        alt={r.name}
                                        className="res-card-img-v2"
                                        onError={(e) => {
                                            e.target.src =
                                                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400";
                                        }}
                                    />
                                    
                                    {r.promoOffer && (
                                        <div className="res-offer-badge-v2">
                                            {r.promoOffer}
                                        </div>
                                    )}

                                    {r.rating >= 4.5 && (
                                        <div className="res-top-rated-pill">
                                            {t("popular")}
                                        </div>
                                    )}
                                    
                                    <button
                                        className="res-fav-btn-v2 active"
                                        onClick={(e) => handleRemoveFromWishlist(e, r.id)}
                                    >
                                        <FiHeart className="heart-icon" />
                                    </button>

                                    <div className="res-details-overlay-v2">
                                        <h3 className="res-name-v2">{r.name}</h3>
                                        
                                        <div className="res-meta-v2">
                                            <div className="res-time-pill-v2">
                                                <FiZap className="zap-icon-v2" />
                                                <span>{(r.r_min ?? 25)}-{(r.r_max ?? 30)} Mins</span>
                                            </div>
                                            
                                            <div className="res-rating-pill-v2">
                                                <FiStar className="star-icon-v2" />
                                                <span>{r.rating > 0 ? r.rating.toFixed(1) : "New"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyWishlist;
