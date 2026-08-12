import React, { useState } from 'react';
import { FiSliders, FiZap, FiStar, FiChevronDown, FiX, FiCheck, FiPercent, FiDollarSign, FiShield, FiClock } from 'react-icons/fi';
import FilterModal from './FilterModal';
import '../UserCss/HomeFilterBar.css';

const HomeFilterBar = ({ activeFilters, onFilterChange, onResetFilters, resultCount }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleQuickFilter = (key, value) => {
        const currentVal = activeFilters[key];
        const newVal = currentVal === value ? null : value;
        onFilterChange({ ...activeFilters, [key]: newVal });
    };

    // Calculate count of active filters
    const activeCount = Object.values(activeFilters).filter(v => v !== null && v !== undefined && v !== false && v !== 'relevance').length;

    return (
        <div className="home-filter-bar-container">
            <div className="filter-chips-scroll-wrapper">
                {/* Main Filter Button (Opens Modal) */}
                <button
                    className={`filter-chip-btn main-filter-btn ${activeCount > 0 ? 'has-active' : ''}`}
                    onClick={() => setIsModalOpen(true)}
                >
                    <FiSliders className="chip-icon" />
                    <span>Filters</span>
                    {activeCount > 0 ? (
                        <span className="active-count-badge">{activeCount}</span>
                    ) : (
                        <FiChevronDown className="chevron-down-icon" />
                    )}
                </button>

                {/* Quick Filter Chips (Matching Image 1) */}
                <button
                    className={`filter-chip-btn ${activeFilters.time === 'near_fast' ? 'active' : ''}`}
                    onClick={() => toggleQuickFilter('time', 'near_fast')}
                >
                    <FiZap className="chip-icon zap-green" />
                    <span>Near & Fast</span>
                    {activeFilters.time === 'near_fast' && <FiCheck className="check-icon" />}
                </button>

                <button
                    className={`filter-chip-btn ${activeFilters.noPackaging ? 'active' : ''}`}
                    onClick={() => toggleQuickFilter('noPackaging', true)}
                >
                    <span>No packaging charges</span>
                    {activeFilters.noPackaging && <FiCheck className="check-icon" />}
                </button>

                <button
                    className={`filter-chip-btn ${activeFilters.rating === '4.0+' ? 'active' : ''}`}
                    onClick={() => toggleQuickFilter('rating', '4.0+')}
                >
                    <FiStar className="chip-icon star-yellow" />
                    <span>Rated 4.0+</span>
                    {activeFilters.rating === '4.0+' && <FiCheck className="check-icon" />}
                </button>

                <button
                    className={`filter-chip-btn ${activeFilters.vegOnly ? 'active' : ''}`}
                    onClick={() => toggleQuickFilter('vegOnly', true)}
                >
                    <span className="veg-dot-icon">🟢</span>
                    <span>Pure Veg</span>
                    {activeFilters.vegOnly && <FiCheck className="check-icon" />}
                </button>

                <button
                    className={`filter-chip-btn ${activeFilters.offers === 'bogo' ? 'active' : ''}`}
                    onClick={() => toggleQuickFilter('offers', 'bogo')}
                >
                    <FiPercent className="chip-icon percent-orange" />
                    <span>Great Offers</span>
                    {activeFilters.offers === 'bogo' && <FiCheck className="check-icon" />}
                </button>

                <button
                    className={`filter-chip-btn ${activeFilters.price === 'under_200' ? 'active' : ''}`}
                    onClick={() => toggleQuickFilter('price', 'under_200')}
                >
                    <span>Under ₹200</span>
                    {activeFilters.price === 'under_200' && <FiCheck className="check-icon" />}
                </button>
            </div>

            {/* Swiggy Style Filter & Sorting Modal (Matching Image 2) */}
            {isModalOpen && (
                <FilterModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    activeFilters={activeFilters}
                    onFilterChange={onFilterChange}
                    onResetFilters={onResetFilters}
                    resultCount={resultCount}
                />
            )}
        </div>
    );
};

export default HomeFilterBar;
