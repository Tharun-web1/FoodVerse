import React, { useState } from 'react';
import { FiX, FiStar, FiZap, FiCalendar, FiPercent, FiShield, FiSliders, FiClock, FiChevronDown } from 'react-icons/fi';
import '../UserCss/HomeFilterBar.css';

const FilterModal = ({ isOpen, onClose, activeFilters, onFilterChange, onResetFilters, resultCount }) => {
    const [activeTab, setActiveTab] = useState('sort');
    const [localFilters, setLocalFilters] = useState({ ...activeFilters });

    if (!isOpen) return null;

    const handleSelectOption = (key, value) => {
        const current = localFilters[key];
        const updated = current === value ? null : value;
        setLocalFilters(prev => ({ ...prev, [key]: updated }));
    };

    const handleApply = () => {
        onFilterChange(localFilters);
        onClose();
    };

    const handleClearAll = () => {
        const reset = {
            sortBy: 'relevance',
            time: null,
            rating: null,
            offers: null,
            price: null,
            vegOnly: false,
            noPackaging: false
        };
        setLocalFilters(reset);
        if (onResetFilters) onResetFilters();
    };

    return (
        <div className="filter-modal-overlay" onClick={onClose}>
            <div className="filter-modal-container" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="filter-modal-header">
                    <h3>Filters and sorting</h3>
                    <div className="header-actions">
                        <button className="clear-all-link-btn" onClick={handleClearAll}>
                            Clear all
                        </button>
                        <button className="modal-close-x-btn" onClick={onClose} aria-label="Close modal">
                            <FiX />
                        </button>
                    </div>
                </div>

                {/* Main Split Body (Left Tab Sidebar + Right Content Area) */}
                <div className="filter-modal-body">
                    {/* Left Tab Sidebar */}
                    <div className="filter-sidebar-tabs">
                        <button
                            className={`sidebar-tab-btn ${activeTab === 'sort' ? 'active' : ''}`}
                            onClick={() => setActiveTab('sort')}
                        >
                            <div className="tab-icon-box">
                                <FiSliders className="tab-icon" />
                            </div>
                            <span>Sort By</span>
                        </button>

                        <button
                            className={`sidebar-tab-btn ${activeTab === 'time' ? 'active' : ''}`}
                            onClick={() => setActiveTab('time')}
                        >
                            <div className="tab-icon-box">
                                <FiClock className="tab-icon" />
                            </div>
                            <span>Time</span>
                        </button>

                        <button
                            className={`sidebar-tab-btn ${activeTab === 'rating' ? 'active' : ''}`}
                            onClick={() => setActiveTab('rating')}
                        >
                            <div className="tab-icon-box">
                                <FiStar className="tab-icon" />
                            </div>
                            <span>Rating</span>
                        </button>

                        <button
                            className={`sidebar-tab-btn ${activeTab === 'offers' ? 'active' : ''}`}
                            onClick={() => setActiveTab('offers')}
                        >
                            <div className="tab-icon-box">
                                <FiPercent className="tab-icon" />
                            </div>
                            <span>Offers</span>
                        </button>

                        <button
                            className={`sidebar-tab-btn ${activeTab === 'price' ? 'active' : ''}`}
                            onClick={() => setActiveTab('price')}
                        >
                            <div className="tab-icon-box">
                                <span className="tab-icon-text">₹₹</span>
                            </div>
                            <span>Dish Price</span>
                        </button>

                        <button
                            className={`sidebar-tab-btn ${activeTab === 'trust' ? 'active' : ''}`}
                            onClick={() => setActiveTab('trust')}
                        >
                            <div className="tab-icon-box">
                                <FiShield className="tab-icon" />
                            </div>
                            <span>Trust Markers</span>
                        </button>
                    </div>

                    {/* Right Options Scrollable Content Area */}
                    <div className="filter-content-area">
                        {/* Sort By Section */}
                        <div className={`filter-group-block ${activeTab === 'sort' ? 'focused' : ''}`}>
                            <div className="group-header">
                                <h4>Sort by</h4>
                                <div className="sort-dropdown-pill">
                                    <span>{localFilters.sortBy ? localFilters.sortBy.replace('_', ' ') : 'Relevance'}</span>
                                    <FiChevronDown />
                                </div>
                            </div>
                            <div className="sort-radio-options">
                                {[
                                    { id: 'relevance', label: 'Relevance (Default)' },
                                    { id: 'delivery_time', label: 'Delivery Time: Low to High' },
                                    { id: 'rating', label: 'Rating: High to Low' },
                                    { id: 'price_low_high', label: 'Cost: Low to High' },
                                    { id: 'price_high_low', label: 'Cost: High to Low' }
                                ].map((opt) => (
                                    <label key={opt.id} className="sort-radio-item">
                                        <input
                                            type="radio"
                                            name="sortBy"
                                            value={opt.id}
                                            checked={(localFilters.sortBy || 'relevance') === opt.id}
                                            onChange={() => setLocalFilters({ ...localFilters, sortBy: opt.id })}
                                        />
                                        <span className="radio-label">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Time Section */}
                        <div className={`filter-group-block ${activeTab === 'time' ? 'focused' : ''}`}>
                            <h4>Time</h4>
                            <div className="options-cards-grid">
                                <div
                                    className={`option-card ${localFilters.time === 'schedule' ? 'selected' : ''}`}
                                    onClick={() => handleSelectOption('time', 'schedule')}
                                >
                                    <div className="card-icon-badge">
                                        <FiCalendar className="card-icon" />
                                    </div>
                                    <span>Schedule</span>
                                </div>
                                <div
                                    className={`option-card ${localFilters.time === 'near_fast' ? 'selected' : ''}`}
                                    onClick={() => handleSelectOption('time', 'near_fast')}
                                >
                                    <div className="card-icon-badge green-badge">
                                        <FiZap className="card-icon zap-green" />
                                    </div>
                                    <span>Near & Fast</span>
                                </div>
                            </div>
                        </div>

                        {/* Restaurant Rating Section */}
                        <div className={`filter-group-block ${activeTab === 'rating' ? 'focused' : ''}`}>
                            <h4>Restaurant Rating</h4>
                            <div className="options-cards-grid">
                                <div
                                    className={`option-card ${localFilters.rating === '3.5+' ? 'selected' : ''}`}
                                    onClick={() => handleSelectOption('rating', '3.5+')}
                                >
                                    <div className="card-icon-badge yellow-badge">
                                        <FiStar className="card-icon star-green" />
                                    </div>
                                    <span>Rated 3.5+</span>
                                </div>
                                <div
                                    className={`option-card ${localFilters.rating === '4.0+' ? 'selected' : ''}`}
                                    onClick={() => handleSelectOption('rating', '4.0+')}
                                >
                                    <div className="card-icon-badge yellow-badge">
                                        <FiStar className="card-icon star-green" />
                                    </div>
                                    <span>Rated 4.0+</span>
                                </div>
                            </div>
                        </div>

                        {/* Offers Section */}
                        <div className={`filter-group-block ${activeTab === 'offers' ? 'focused' : ''}`}>
                            <h4>Offers</h4>
                            <div className="options-cards-grid">
                                <div
                                    className={`option-card ${localFilters.offers === 'bogo' ? 'selected' : ''}`}
                                    onClick={() => handleSelectOption('offers', 'bogo')}
                                >
                                    <div className="card-icon-badge orange-badge">
                                        <FiPercent className="card-icon percent-orange" />
                                    </div>
                                    <span>Buy 1 Get 1 and more</span>
                                </div>
                                <div
                                    className={`option-card ${localFilters.offers === 'deals' ? 'selected' : ''}`}
                                    onClick={() => handleSelectOption('offers', 'deals')}
                                >
                                    <div className="card-icon-badge orange-badge">
                                        <FiPercent className="card-icon percent-orange" />
                                    </div>
                                    <span>Deals of the Day</span>
                                </div>
                            </div>
                        </div>

                        {/* Dish Price Section */}
                        <div className={`filter-group-block ${activeTab === 'price' ? 'focused' : ''}`}>
                            <h4>Dish Price</h4>
                            <div className="options-cards-grid three-col">
                                <div
                                    className={`option-card ${localFilters.price === 'under_200' ? 'selected' : ''}`}
                                    onClick={() => handleSelectOption('price', 'under_200')}
                                >
                                    <div className="card-icon-badge price-badge">
                                        <span className="price-tag-accent">₹</span>
                                    </div>
                                    <span>Under ₹200</span>
                                </div>
                                <div
                                    className={`option-card ${localFilters.price === '200_350' ? 'selected' : ''}`}
                                    onClick={() => handleSelectOption('price', '200_350')}
                                >
                                    <div className="card-icon-badge price-badge">
                                        <span className="price-tag-accent">₹₹</span>
                                    </div>
                                    <span>₹200 - ₹350</span>
                                </div>
                                <div
                                    className={`option-card ${localFilters.price === 'above_350' ? 'selected' : ''}`}
                                    onClick={() => handleSelectOption('price', 'above_350')}
                                >
                                    <div className="card-icon-badge price-badge">
                                        <span className="price-tag-accent">₹₹₹</span>
                                    </div>
                                    <span>Above ₹350</span>
                                </div>
                            </div>
                        </div>

                        {/* Trust Markers Section */}
                        <div className={`filter-group-block ${activeTab === 'trust' ? 'focused' : ''}`}>
                            <h4>Trust Markers</h4>
                            <div className="options-cards-grid">
                                <div
                                    className={`option-card ${localFilters.vegOnly ? 'selected' : ''}`}
                                    onClick={() => setLocalFilters({ ...localFilters, vegOnly: !localFilters.vegOnly })}
                                >
                                    <span>🟢 Pure Veg Only</span>
                                </div>
                                <div
                                    className={`option-card ${localFilters.noPackaging ? 'selected' : ''}`}
                                    onClick={() => setLocalFilters({ ...localFilters, noPackaging: !localFilters.noPackaging })}
                                >
                                    <span>📦 No Packaging Charges</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer (Close + Show Results) */}
                <div className="filter-modal-footer">
                    <button className="footer-close-btn" onClick={onClose}>
                        Close
                    </button>
                    <button className="footer-show-results-btn" onClick={handleApply}>
                        Show results
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
