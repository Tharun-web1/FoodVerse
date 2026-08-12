import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import FloatingMap from './FloatingMap';
import { API_BASE_URL } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiEye, FiEyeOff, FiMapPin, FiStar } from 'react-icons/fi';
import '../UserCss/HiddenRestaurants.css';

const HiddenRestaurants = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [hiddenRestaurants, setHiddenRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    const getCleanText = (key, fallback) => {
        const val = t(key);
        if (!val || val === key || val.includes('_')) return fallback;
        return val;
    };

    const loadHiddenRestaurants = async () => {
        setLoading(true);
        const hiddenIds = JSON.parse(localStorage.getItem('hiddenRestaurants') || '[]');
        
        if (hiddenIds.length === 0) {
            setHiddenRestaurants([]);
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(`${API_BASE_URL}/restaurants/all`);
            const hiddenList = res.data.filter(r => hiddenIds.includes(Number(r.id)));
            setHiddenRestaurants(hiddenList);
        } catch (err) {
            console.error("Error fetching hidden restaurants:", err);
            setHiddenRestaurants([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHiddenRestaurants();
    }, []);

    const handleBack = () => {
        navigate('/profile', { state: { openProfileSidebar: true } });
    };

    const unhideRestaurant = (resId, resName) => {
        const hiddenIds = JSON.parse(localStorage.getItem('hiddenRestaurants') || '[]');
        const updatedHidden = hiddenIds.filter(id => Number(id) !== Number(resId));
        localStorage.setItem('hiddenRestaurants', JSON.stringify(updatedHidden));
        
        setHiddenRestaurants(prev => prev.filter(r => Number(r.id) !== Number(resId)));
        showToast(`${resName || "Restaurant"} ${getCleanText("unhidden_success", "unhidden successfully!")}`, "success");
    };

    return (
        <>
            <Navbar />
            <div className="hidden-restaurants-page">
                <div className="hidden-res-container">
                    <header className="page-header-v3">
                        <div className="header-main-row">
                            <button className="back-btn-v3" onClick={handleBack} type="button" aria-label="Go Back">
                                <FiArrowLeft />
                            </button>
                            <h1 className="page-title">{getCleanText("hidden_restaurants", "Hidden Restaurants")}</h1>
                        </div>
                        <p className="page-subtitle">Manage restaurants you've hidden from your search & feed</p>
                    </header>

                    {loading ? (
                        <div className="hidden-res-skeleton">
                            <div className="shimmer-card"></div>
                            <div className="shimmer-card"></div>
                        </div>
                    ) : hiddenRestaurants.length > 0 ? (
                        <div className="hidden-res-grid">
                            {hiddenRestaurants.map((res) => (
                                <div key={res.id} className="hidden-res-card animate__animated animate__fadeIn">
                                    <div className="hidden-res-img-box">
                                        <img 
                                            src={`${API_BASE_URL}/restaurants/${res.id}/image`} 
                                            alt={res.name}
                                            onError={(e) => {
                                                e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=300";
                                            }}
                                        />
                                        <span className="hidden-badge">
                                            <FiEyeOff /> Hidden
                                        </span>
                                    </div>

                                    <div className="hidden-res-details">
                                        <div className="res-title-row">
                                            <h3 className="res-name">{res.name}</h3>
                                            <div className="res-rating">
                                                <FiStar className="star-icon" />
                                                <span>{res.rating ? Number(res.rating).toFixed(1) : "New"}</span>
                                            </div>
                                        </div>

                                        <p className="res-location">
                                            <FiMapPin className="pin-icon" /> {res.location || "Nearby"}
                                        </p>

                                        <button 
                                            className="unhide-action-btn"
                                            onClick={() => unhideRestaurant(res.id, res.name)}
                                        >
                                            <FiEye /> {getCleanText("unhide_restaurant", "Unhide Restaurant")}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-hidden-empty-state">
                            <div className="empty-icon-circle">
                                <FiEyeOff />
                            </div>
                            <h3>{getCleanText("no_hidden_restaurants", "No Hidden Restaurants")}</h3>
                            <p>Restaurants you hide from menu options will appear here. You can unhide them anytime.</p>
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

export default HiddenRestaurants;
