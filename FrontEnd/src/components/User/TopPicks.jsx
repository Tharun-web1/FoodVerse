import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import '../UserCss/TopPicks.css';
import { API_BASE_URL } from '../../api/api';
import { useTranslation } from "react-i18next";

const TopPicks = ({ favorites, toggleFavorite }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

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
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchRecommendations();
    }, [token]);

    const scroll = (direction) => {
        const scrollAmount = 320;
        scrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    const fetchRecommendations = async () => {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get(`${API_BASE_URL}/restaurants`, { headers });

            // Simple recommendation logic: show highly rated restaurants
            const topRated = res.data
                .filter(r => r.rating >= 4.0)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 6);

            setRecommendations(topRated);
        } catch (err) {
            console.error('Error fetching recommendations:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="top-picks-section">
                <h2>{t("top_picks_for_you")}</h2>
                <div className="picks-loading">{t("loading_recommendations")}</div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return null;
    }

    return (
        <div className="top-picks-section">
            <div className="picks-header">
                <div className="picks-title-group">
                    <h2>{t("top_picks_for_you")}</h2>
                    <p className="picks-subtitle">{t("handpicked_subtitle")}</p>
                </div>
                <div className="scroll-buttons">
                    <button className="scroll-btn" onClick={() => scroll("left")}><FiChevronLeft /></button>
                    <button className="scroll-btn" onClick={() => scroll("right")}><FiChevronRight /></button>
                </div>
            </div>

            <div className="picks-grid horizontal-scroll" ref={scrollRef}>
                {recommendations.map((restaurant) => (
                    <div
                        key={restaurant.id}
                        className="pick-card"
                        onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    >
                        <div className="pick-image-container">
                            <img
                                src={`${API_BASE_URL}/restaurants/${restaurant.id}/image`}
                                alt={restaurant.name}
                                className="pick-image"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                }}
                            />
                            <div className="recommended-badge">
                                <FiStar /> {t("recommended")}
                            </div>
                            <button
                                className={`fav-toggle-btn ${favorites.has(restaurant.id) ? 'active' : ''}`}
                                onClick={(e) => toggleFavorite(e, restaurant.id)}
                            >
                                <FiHeart className="heart-icon" />
                            </button>
                        </div>

                        <div className="pick-info">
                            <h3 className="pick-name">{restaurant.name}</h3>
                            <div className="pick-meta">
                                <span className="pick-rating">
                                    <FiStar className="star-filled" /> {restaurant.rating.toFixed(1)}
                                </span>
                                <span className="pick-time">
                                    {restaurant.r_min || 25}-{restaurant.r_max || 30} {t("mins") || "MINS"}
                                </span>
                            </div>
                            <p className="pick-cuisines">{restaurant.discription}</p>
                            <p className="pick-location">{getArea(restaurant.location)}...</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopPicks;
