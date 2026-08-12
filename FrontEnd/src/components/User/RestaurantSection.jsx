import { useNavigate } from "react-router-dom";
import { useRef, useEffect } from "react";
import { FiStar, FiHeart, FiZap } from "react-icons/fi";
import "../UserCss/RestuarentCard.css";
import { API_BASE_URL } from "../../api/api";
import { useTranslation } from "react-i18next";

const RestaurantSection = ({ 
  restaurants, 
  onLoadMore, 
  hasMore, 
  isLoadingMore, 
  favorites, 
  toggleFavorite,
  title,
  showClearFilters = false,
  onClearFilters
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const observerTarget = useRef(null);

  const getArea = (address) => {
    if (!address) return "";
    const parts = address.split(',').map(p => p.trim());
    // Find the first part that doesn't look like a floor/unit/number
    const skipKeywords = ['floor', 'level', 'unit', 'flat', 'house', 'no.', 'building', 'tower', 'next to', 'opposite'];
    const area = parts.find(p => {
      const lower = p.toLowerCase();
      // Skip if it contains any "door/floor" keywords or if it's just numbers
      return !skipKeywords.some(k => lower.includes(k)) && !/^\d+$/.test(p);
    });
    return area || parts[0];
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && onLoadMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  const displayedRestaurants = restaurants || [];

  return (
    <div className="restaurant-section">
      <div className="section-header">
        <h2>{title || t("restaurants_with_us")}</h2>
        {showClearFilters && onClearFilters && (
          <button className="clear-filters-btn" onClick={onClearFilters}>
            {t("clear_all", "Clear All")}
          </button>
        )}
      </div>

      <div className="restaurant-grid">
        {displayedRestaurants.length === 0 ? (
          <div className="no-restaurants">
            <p>{t("no_restaurants_found", "No restaurants found matching your active filters.")}</p>
            {showClearFilters && onClearFilters && (
              <button className="clear-filters-btn secondary" onClick={onClearFilters}>
                {t("clear_filters", "Clear Filters")}
              </button>
            )}
          </div>
        ) : (
          displayedRestaurants.map((r) => (
            <div
              key={r.id}
              className="restaurant-card-v2 animate__animated animate__fadeInUp"
              onClick={() => navigate(`/restaurant/${r.id}`)}
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
                
                {/* Offer Overlay */}
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
                  className={`res-fav-btn-v2 ${favorites?.has(Number(r.id)) ? 'active' : ''}`}
                  onClick={(e) => toggleFavorite(e, r.id)}
                >
                  <FiHeart className="heart-icon" />
                </button>

                {/* Details Overlay on the image bottom */}
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
          ))
        )}
        <div ref={observerTarget} className="scroll-sentinel">
          {isLoadingMore && (
            <div className="loading-more">
              <div className="loader-dots">
                <span></span><span></span><span></span>
              </div>
              <p>{t("loading_more_restaurants")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantSection;
