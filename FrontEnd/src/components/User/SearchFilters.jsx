import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import '../UserCss/SearchFilters.css';
import { useTranslation } from "react-i18next";

const SearchFilters = ({ onFilterChange, showFilters, onToggleFilters, searchQuery, onClearSearch }) => {
    const { t } = useTranslation();
    // Local filters state remains here as it's specific to this component's form
    const [filters, setFilters] = useState({
        cuisine: '',
        rating: '',
        priceRange: '',
        isVeg: false
    });

    const cuisines = [
        { label: t('all'), value: 'All' },
        { label: t('biryani'), value: 'Biryani' },
        { label: t('pizza'), value: 'Pizza' },
        { label: t('burger'), value: 'Burger' },
        { label: t('chinese'), value: 'Chinese' },
        { label: t('south_indian'), value: 'South Indian' },
        { label: t('desserts'), value: 'Desserts' },
        { label: t('starters'), value: 'Starters' }
    ];

    const ratings = [
        { label: t('all'), value: 'All' },
        { label: t('stars_4'), value: '4+ Stars' },
        { label: t('stars_3'), value: '3+ Stars' },
        { label: t('stars_2'), value: '2+ Stars' }
    ];

    const priceRanges = [
        { label: t('all'), value: 'All' },
        { label: t('budget'), value: '₹ - Budget' },
        { label: t('mid_range'), value: '₹₹ - Mid Range' },
        { label: t('premium'), value: '₹₹₹ - Premium' }
    ];

    // Notify parent on filter change
    useEffect(() => {
        const activeFilters = {
            cuisine: filters.cuisine === 'All' ? '' : filters.cuisine,
            rating: filters.rating === 'All' ? '' : filters.rating.split('+')[0],
            priceRange: filters.priceRange === 'All' ? '' : filters.priceRange,
            isVeg: filters.isVeg
        };
        onFilterChange(activeFilters);
    }, [filters, onFilterChange]);

    const handleFilterChange = (key, value) => {
        // Toggle: if clicking already active filter, set it to '' (or false)
        if (filters[key] === value) {
            setFilters(prev => ({ ...prev, [key]: key === 'isVeg' ? false : '' }));
        } else {
            setFilters(prev => ({ ...prev, [key]: value }));
        }
    };

    const clearAllFilters = () => {
        setFilters({
            cuisine: '',
            rating: '',
            priceRange: '',
            isVeg: false
        });
    };

    const hasActiveFilters = filters.cuisine || filters.rating || filters.priceRange || filters.isVeg;

    return (
        <div className="search-filters-container">
            {/* Filter Panel */}
            {showFilters && (
                <div className="filters-panel">
                    <div className="filters-header">
                        <div className="panel-top">
                            <h3 className="panel-title">{t("filters")}</h3>
                            <button className="close-panel-btn" onClick={onToggleFilters}>
                                <FiX />
                            </button>
                        </div>
                        {hasActiveFilters && (
                            <button className="clear-all-link" onClick={clearAllFilters}>
                                {t("clear_all")}
                            </button>
                        )}
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">{t("cuisine")}</label>
                        <div className="filter-options">
                            {cuisines.map(c => (
                                <button
                                    key={c.value}
                                    className={`filter-chip ${filters.cuisine === c.value ? 'active' : ''}`}
                                    onClick={() => handleFilterChange('cuisine', c.value)}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">{t("rating")}</label>
                        <div className="filter-options">
                            {ratings.map(r => (
                                <button
                                    key={r.value}
                                    className={`filter-chip ${filters.rating === r.value ? 'active' : ''}`}
                                    onClick={() => handleFilterChange('rating', r.value)}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">{t("price_range")}</label>
                        <div className="filter-options">
                            {priceRanges.map(p => (
                                <button
                                    key={p.value}
                                    className={`filter-chip ${filters.priceRange === p.value ? 'active' : ''}`}
                                    onClick={() => handleFilterChange('priceRange', p.value)}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label veg-toggle-label">
                            <input
                                type="checkbox"
                                checked={filters.isVeg}
                                onChange={(e) => handleFilterChange('isVeg', e.target.checked)}
                                className="veg-checkbox"
                            />
                            <span className="veg-icon">🌱</span>
                            <span>{t("pure_veg_only")}</span>
                        </label>
                    </div>
                </div>
            )}


        </div>
    );
};

export default SearchFilters;
