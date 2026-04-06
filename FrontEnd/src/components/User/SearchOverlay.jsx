import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiArrowLeft, FiShoppingBag, FiClock } from 'react-icons/fi';
import { IoRestaurantOutline } from 'react-icons/io5';
import '../UserCss/SearchOverlay.css';
import { API_BASE_URL } from '../../api/api';
import { useTranslation } from "react-i18next";

const SearchOverlay = ({
    isOpen,
    onClose,
    onSearch,
    searchQuery,
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [localQuery, setLocalQuery] = useState(searchQuery || "");
    const [recentSearches, setRecentSearches] = useState([]);
    const [searchResults, setSearchResults] = useState({ restaurants: [], dishes: [] });
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLocalQuery(searchQuery || "");
            const history = JSON.parse(localStorage.getItem('searchHistory') || "[]");
            setRecentSearches(history);
        }
    }, [isOpen, searchQuery]);

    // Real-time backend search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localQuery.length >= 2) {
                setIsSearching(true);
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                import('axios').then(({ default: axios }) => {
                    axios.get(`${API_BASE_URL}/restaurants/search?query=${localQuery}`, { headers })
                        .then(res => {
                            setSearchResults(res.data);
                            setIsSearching(false);
                        })
                        .catch(err => {
                            console.error("Search error:", err);
                            setIsSearching(false);
                        });
                });
            } else {
                setSearchResults({ restaurants: [], dishes: [] });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localQuery]);

    const addToHistory = (query) => {
        if (!query || typeof query !== 'string' || !query.trim()) return;
        const history = JSON.parse(localStorage.getItem('searchHistory') || "[]");
        const newHistory = [query, ...history.filter(h => h !== query)].slice(0, 5);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        setRecentSearches(newHistory);
    };

    const clearHistory = () => {
        localStorage.setItem('searchHistory', "[]");
        setRecentSearches([]);
    };

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        addToHistory(localQuery);
        onSearch(localQuery);
        onClose();
    };

    const handleItemClick = (item) => {
        if (typeof item === 'string') {
            setLocalQuery(item);
            addToHistory(item);
        } else if (item && item.itemName) {
            addToHistory(item.itemName);
            onClose();
            if (item.restaurantId) {
                navigate(`/restaurant/${item.restaurantId}?search=${encodeURIComponent(item.itemName)}`);
            }
        }
    };

    const handleRestaurantClick = (id) => {
        onClose();
        navigate(`/restaurant/${id}`);
    };


    if (!isOpen) return null;

    return (
        <div className="search-overlay-wrapper">
            <div className="search-header">
                <button className="back-btn" onClick={onClose}>
                    <FiArrowLeft />
                </button>
                <form className="search-input-container" onSubmit={handleSearchSubmit}>
                    <input
                        autoFocus
                        type="text"
                        placeholder={t("search_placeholder")}
                        value={localQuery}
                        onChange={(e) => setLocalQuery(e.target.value)}
                    />
                    <FiSearch className="search-icon-overlay" />
                    {localQuery && (
                        <FiX className="clear-icon-overlay" onClick={() => setLocalQuery("")} />
                    )}
                </form>
            </div>

            <div className="search-overlay-content">


                {localQuery.length >= 2 ? (
                    <div className="search-suggestions-container">
                        {isSearching ? (
                            <div className="search-loading-premium">{t("searching")}</div>
                        ) : searchResults.restaurants.length > 0 || searchResults.dishes.length > 0 ? (
                            <>
                                {searchResults.restaurants.length > 0 && (
                                    <div className="search-section-premium">
                                        <h3 className="section-title-premium">{t("restaurants")}</h3>
                                        <div className="results-grid-premium">
                                            {searchResults.restaurants.map((res) => (
                                                <div
                                                    key={res.id}
                                                    className="search-result-card"
                                                    onClick={() => handleRestaurantClick(res.id)}
                                                >
                                                    <div className="result-card-inner">
                                                        <div className="result-card-info">
                                                            <div className="result-name-premium">{res.name}</div>
                                                            <div className="result-type-premium">{res.discription}</div>
                                                            <div className="result-meta-premium">
                                                                <span className="result-rating-pill">★ {res.rating || '4.0'}</span>
                                                                <span className="result-time-premium">30-35 {t("mins")}</span>
                                                            </div>
                                                        </div>
                                                        <div className="result-card-media">

                                                            <img src={`${API_BASE_URL}/restaurants/${res.id}/image`} alt={res.name} />

                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {searchResults.dishes.length > 0 && (
                                    <div className="search-section-premium">
                                        <h3 className="section-title-premium">{t("dishes")}</h3>
                                        <div className="results-grid-premium">
                                            {searchResults.dishes.map((dish) => (
                                                <div
                                                    key={dish.id}
                                                    className={`search-result-card ${dish.available === false ? 'item-unavailable' : ''}`}
                                                    onClick={() => dish.available !== false && handleItemClick(dish)}
                                                >
                                                    <div className="result-card-inner">
                                                        <div className="result-card-info">
                                                            <div className="result-name-premium">
                                                                {dish.itemName}
                                                                {dish.available === false && <span style={{fontSize: '10px', color: '#686b78', marginLeft: '8px', border: '1px solid #686b78', padding: '2px 4px', borderRadius: '4px'}}>{t("unavailable")}</span>}
                                                            </div>
                                                            <div className="result-price-premium">₹{dish.price}</div>
                                                            <div className="result-res-meta">
                                                                <IoRestaurantOutline /> {dish.restaurantName}
                                                            </div>
                                                            <div className="result-rating-mini">
                                                                ★ {dish.rating || '4.2'}
                                                            </div>
                                                        </div>
                                                        <div className="result-card-media">
                                                            <img
                                                                src={`${API_BASE_URL}/restaurants/${dish.id}/itemimg`}
                                                                alt={dish.itemName}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                            <div className="media-placeholder" style={{ display: 'none' }}>
                                                                <FiShoppingBag />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="no-suggestions-premium">
                                <p>{t("no_results_found_for")} "{localQuery}"</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="discovery-hub-initial">
                        {recentSearches.length > 0 && (
                            <div className="recent-searches-history">
                                <div className="history-header">
                                    <h3 className="section-title-premium">{t("recent_searches")}</h3>
                                    <button className="clear-history-btn" onClick={clearHistory}>{t("clear")}</button>
                                </div>
                                <div className="history-list">
                                    {recentSearches.map((search) => (
                                        <div
                                            key={search}
                                            className="history-item"
                                            onClick={() => handleItemClick(search)}
                                        >
                                            <FiClock className="history-icon" />
                                            <span>{search}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}



                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchOverlay;
