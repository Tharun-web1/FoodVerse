import React from 'react';
import { FiStar, FiZap, FiTag, FiArrowRight, FiCheck } from 'react-icons/fi';
import { IoLeafOutline } from 'react-icons/io5';
import { HiSparkles } from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import '../UserCss/ExploreMore.css';

const ExploreMore = ({ onExploreClick, activeFilters = {}, sortBy = '' }) => {
    const { t } = useTranslation();

    const getTranslation = (key, fallback) => {
        if (!t) return fallback;
        const val = t(key);
        if (!val || val === key) return fallback;
        return val;
    };

    const isVegActive = !!activeFilters?.isVeg;
    const isRatingActive = activeFilters?.rating === '4';
    const isDeliveryActive = sortBy === 'delivery';
    const isOffersActive = !!activeFilters?.hasOffers;

    const exploreCards = [
        {
            id: 'veg',
            title: getTranslation('pure_veg_places', 'Pure Veg Places'),
            description: getTranslation('veg_desc', '100% Vegetarian selections'),
            icon: <IoLeafOutline />,
            badge: getTranslation('badge_veg', '100% Green'),
            themeClass: 'veg-theme',
            isActive: isVegActive,
            filterData: { type: 'veg' }
        },
        {
            id: 'rated',
            title: getTranslation('best_rated_places', 'Best Rated Places'),
            description: getTranslation('rated_desc', 'Top 4.0+ rated places'),
            icon: <FiStar />,
            badge: getTranslation('badge_rated', 'Top Tier'),
            themeClass: 'rated-theme',
            isActive: isRatingActive,
            filterData: { type: 'rating' }
        },
        {
            id: 'delivery',
            title: getTranslation('express_delivery', 'Express Delivery'),
            description: getTranslation('delivery_desc', 'Quickest turnaround times'),
            icon: <FiZap />,
            badge: getTranslation('badge_delivery', '⚡ Fast'),
            themeClass: 'delivery-theme',
            isActive: isDeliveryActive,
            filterData: { type: 'delivery' }
        },
        {
            id: 'offers',
            title: getTranslation('great_offers', 'Great Offers'),
            description: getTranslation('offers_desc', 'Flat discounts & promo codes'),
            icon: <FiTag />,
            badge: getTranslation('badge_offers', '🔥 Deals'),
            themeClass: 'offers-theme',
            isActive: isOffersActive,
            filterData: { type: 'offers' }
        }
    ];

    return (
        <section className="explore-more-section">
            <div className="explore-header-wrapper">
                <div className="explore-title-group">
                    <span className="explore-subtitle-pill">
                        <HiSparkles className="sparkle-icon" />
                        {getTranslation('curated_collections', 'Curated Collections')}
                    </span>
                    <h2 className="explore-section-title">
                        {getTranslation('explore_more', 'Explore More')}
                    </h2>
                </div>
                <p className="explore-section-subtitle">
                    {getTranslation('explore_subtitle', 'Filter by what matters most to your taste and time')}
                </p>
            </div>

            <div className="explore-grid">
                {exploreCards.map((card) => (
                    <div
                        key={card.id}
                        className={`explore-card ${card.themeClass} ${card.isActive ? 'is-active' : ''}`}
                        onClick={() => onExploreClick && onExploreClick(card.filterData)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onExploreClick && onExploreClick(card.filterData);
                            }
                        }}
                    >
                        <div className="explore-card-left">
                            <div className="explore-icon-wrapper">
                                {card.icon}
                            </div>
                        </div>

                        <div className="explore-card-center">
                            <div className="explore-title-row">
                                <h3 className="explore-card-title">{card.title}</h3>
                                {card.isActive ? (
                                    <span className="active-pill">
                                        <FiCheck /> {getTranslation('active', 'Active')}
                                    </span>
                                ) : (
                                    <span className="category-pill">{card.badge}</span>
                                )}
                            </div>
                            <p className="explore-card-desc">{card.description}</p>
                        </div>

                        <div className="explore-card-right">
                            <FiArrowRight className="action-arrow" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ExploreMore;
