import { useNavigate } from "react-router-dom";
import { useRef, useEffect } from "react";
import { FiStar, FiHeart } from "react-icons/fi";
import "../UserCss/RestuarentCard.css";
import { API_BASE_URL } from "../../api/api";
import { useTranslation } from "react-i18next";

const RestaurantSection = ({ restaurants, onLoadMore, hasMore, isLoadingMore, favorites, toggleFavorite }) => {
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
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
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

  const displayedRestaurants = restaurants;

  return (
    <div className="restaurant-section " >
      <div className="section-header">
        <h2>{t("restaurants_with_us")}</h2>
      </div>

      <div className="restaurant-grid">
        {displayedRestaurants.length === 0 ? (
          <div className="no-restaurants">
            <p>{t("no_restaurants_found")}</p>
          </div>
        ) : (
          displayedRestaurants.map((r) => (
            <div
              key={r.id}
              className="restaurant-card1"
              onClick={() => navigate(`/restaurant/${r.id}`)}
            >
              <div className="restaurant-image-container">
                <img
                  src={`${API_BASE_URL}/restaurants/${r.id}/image`}
                  alt={r.name}
                  className="restaurant-image"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x200?text=No+Image";
                  }}
                />
                {r.rating >= 4.5 && (
                  <div className="top-rated-badge">
                    <span>{t("top_rated")}</span>
                  </div>
                )}
                <button
                  className={`fav-toggle-btn ${favorites?.has(Number(r.id)) ? 'active' : ''}`}
                  onClick={(e) => toggleFavorite(e, r.id)}
                >
                  <FiHeart className="heart-icon" />
                </button>
              </div>



              <div className="restaurant-info">
                <h3 className="restaurant-name">{r.name}</h3>
                <div className="res-card-meta">
                  <span className="res-card-rating">
                    <FiStar className="star-filled" style={{ fill: "var(--success)", color: "var(--success)" }} /> {r.rating > 0 ? r.rating.toFixed(1) : t("new")}
                  </span>
                  <span className="res-card-dot">•</span>
                  <span className="res-card-time">
                    {(r.r_min ?? 25)}-{(r.r_max ?? 30)} {t("mins") || "MINS"}
                  </span>

                </div>
                <p className="restaurant-cuisines">{r.discription}</p>
                <p className="restaurant-location">{getArea(r.location)}...</p>
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
          {!hasMore && restaurants.length > 0 && (
            <div className="end-message">
              <p>{t("end_of_list_msg")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantSection;
