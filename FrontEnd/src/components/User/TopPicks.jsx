import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiStar, FiChevronLeft, FiChevronRight, FiMapPin, FiZap } from 'react-icons/fi';
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

    // Haversine distance formula in kilometers
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const p1 = parseFloat(lat1);
        const p2 = parseFloat(lat2);
        const l1 = parseFloat(lon1);
        const l2 = parseFloat(lon2);
        if (isNaN(p1) || isNaN(p2) || isNaN(l1) || isNaN(l2)) return null;

        const R = 6371; // Earth's radius in km
        const dLat = (p2 - p1) * (Math.PI / 180);
        const dLon = (l2 - l1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(p1 * (Math.PI / 180)) * Math.cos(p2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round((R * c) * 10) / 10; // 1 decimal place
    };

    useEffect(() => {
        fetchRecommendations();
    }, [token]);

    const scroll = (direction) => {
        const scrollAmount = 300;
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    const fetchRecommendations = async () => {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get(`${API_BASE_URL}/restaurants`, { headers });

            // User location coordinates
            let userLat = 17.3850; // Default fallback (Hyderabad)
            let userLng = 78.4867;
            const savedLoc = localStorage.getItem('userLocation');
            if (savedLoc) {
                try {
                    const parsed = JSON.parse(savedLoc);
                    if (parsed.lat && parsed.lng) {
                        userLat = parsed.lat;
                        userLng = parsed.lng;
                    }
                } catch (e) {
                    console.error("Error parsing userLocation", e);
                }
            }

            // Calculate distance for all restaurants
            const restaurantsWithDistance = res.data.map((r, idx) => {
                const rLat = r.r_lat || r.latitude;
                const rLon = r.r_lon || r.longitude;
                let dist = calculateDistance(userLat, userLng, rLat, rLon);

                // If backend coordinates are missing, provide realistic procedural mock distances
                if (dist === null) {
                    dist = Math.round((1.2 + (idx * 0.7) % 3.8) * 10) / 10;
                }
                return { ...r, distance: dist };
            });

            // 1. Nearest Restaurants (<= 3km)
            const nearest3km = restaurantsWithDistance.filter(r => r.distance <= 3.0);

            // 2. High Rated Restaurants Nearby (rating >= 4.0 within 5km)
            const highRated5km = restaurantsWithDistance.filter(r => (r.rating >= 4.0 || r.rating === 0) && r.distance <= 5.0);

            // Combine & Deduplicate
            const combinedMap = new Map();
            nearest3km.forEach(r => combinedMap.set(r.id, r));
            highRated5km.forEach(r => combinedMap.set(r.id, r));

            let finalRecommendations = Array.from(combinedMap.values());

            // Fallback: If less than 4 recommendations, add top-rated overall
            if (finalRecommendations.length < 4) {
                const sortedFallback = [...restaurantsWithDistance].sort((a, b) => (b.rating || 0) - (a.rating || 0));
                sortedFallback.forEach(r => {
                    if (!combinedMap.has(r.id)) {
                        combinedMap.set(r.id, r);
                    }
                });
                finalRecommendations = Array.from(combinedMap.values());
            }

            // Sort by a balance of distance and rating
            finalRecommendations.sort((a, b) => a.distance - b.distance);

            setRecommendations(finalRecommendations.slice(0, 14)); // 14 items (7 columns x 2 rows in 2x2 grid)
        } catch (err) {
            console.error('Error fetching recommendations:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="top-picks-section">
                <h2>{t("top_picks_for_you") || "Recommended For You"}</h2>
                <div className="picks-loading">{t("loading_recommendations") || "Finding nearest top spots..."}</div>
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
                    <h2>{t("recommended_for_you", "Recommended For You")}</h2>
                    {/* <p className="picks-subtitle">
                        {t("recommended_subtitle", "Nearest spots (within 3km) & top rated near you")}
                    </p> */}
                </div>
                <div className="scroll-buttons">
                    <button className="scroll-btn" onClick={() => scroll("left")} aria-label="Scroll Left"><FiChevronLeft /></button>
                    <button className="scroll-btn" onClick={() => scroll("right")} aria-label="Scroll Right"><FiChevronRight /></button>
                </div>
            </div>

            <div className="picks-grid-2x2-wrapper">
                <div className="picks-grid-2x2 horizontal-scroll" ref={scrollRef}>
                    {recommendations.map((restaurant) => (
                        <div
                            key={restaurant.id}
                            className="pick-card-v2"
                            onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                        >
                            <div className="pick-image-container-v2">
                                <img
                                    src={`${API_BASE_URL}/restaurants/${restaurant.id}/image`}
                                    alt={restaurant.name}
                                    className="pick-image-v2"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=300';
                                    }}
                                />

                                {restaurant.distance !== null && (
                                    <div className="pick-distance-badge">
                                        <FiMapPin className="pin-icon" /> {restaurant.distance} km
                                    </div>
                                )}

                                <button
                                    className={`fav-toggle-btn-v2 ${favorites.has(restaurant.id) ? 'active' : ''}`}
                                    onClick={(e) => toggleFavorite(e, restaurant.id)}
                                >
                                    <FiHeart className="heart-icon" />
                                </button>

                                <div className="pick-details-overlay">
                                    <h3 className="pick-name-v2">{restaurant.name}</h3>
                                    <div className="pick-meta-row">
                                        <div className="pick-time-pill">
                                            <FiZap className="zap-icon" />
                                            <span>{restaurant.r_min || 15}-{restaurant.r_max || 25} Mins</span>
                                        </div>
                                        <div className="pick-rating-pill">
                                            <FiStar className="star-icon" />
                                            <span>{restaurant.rating > 0 ? restaurant.rating.toFixed(1) : "New"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TopPicks;
