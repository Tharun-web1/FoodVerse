import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "../UserCss/CategoryPage.css";
import "../UserCss/RestuarentCard.css";
import { API_BASE_URL } from "../../api/api";
import NoOrdersImg from "../../assets/images/no-orders.png"; 
import FloatingMap from "./FloatingMap";
import { FiHeart, FiStar } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const CategoryPage = () => {
  const { t } = useTranslation();
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE_URL}/users/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
      const favIds = new Set(res.data.map(f => Number(f.restaurantId)));
      setFavorites(favIds);
      }).catch(err => console.error("Error fetching favorites", err));
    }
  }, [token]);

  const toggleFavorite = async (e, resId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return alert(t("login_to_favorite"));

    // Optimistic update
    setFavorites(prev => {
      const newFavs = new Set(prev);
      if (newFavs.has(resId)) newFavs.delete(resId);
      else newFavs.add(resId);
      return newFavs;
    });

    try {
      await axios.post(`${API_BASE_URL}/users/favorites/toggle/${resId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Error toggling favorite", err);
      // Revert on error
      setFavorites(prev => {
        const newFavs = new Set(prev);
        if (newFavs.has(resId)) newFavs.delete(resId);
        else newFavs.add(resId);
        return newFavs;
      });
    }
  };

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

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/restaurants/category/${categoryName}`)
      .then((res) => {
        // Group by restaurant to get unique restaurant objects
        const uniqueRestaurantsMap = {};
        res.data.forEach((item) => {
          if (!uniqueRestaurantsMap[item.restaurantId]) {
            uniqueRestaurantsMap[item.restaurantId] = {
              id: item.restaurantId,
              name: item.restaurantName,
              rating: Number(item.rating) || 0,
              // These might be missing from the category API, adding defaults/fallbacks
              location: item.location || "Nearby",
              description: item.description || `${categoryName} Special`,
              r_min: item.r_min || 25,
              r_max: item.r_max || 30
            };
          }
        });
        setRestaurants(Object.values(uniqueRestaurantsMap));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [categoryName]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="category-page-loader">
          <div className="shimmer-card"></div>
          <div className="shimmer-card"></div>
          <div className="shimmer-card"></div>
        </div>
      </>
    );
  }

  // Find the translation key for the category if it exists
  const categoryKeys = {
    'Biryani': 'biryani',
    'Pizza': 'pizza',
    'Burger': 'burger',
    'Cakes': 'cakes',
    'Desserts': 'desserts',
    'Ice Cream': 'ice_cream',
    'Chinese': 'chinese',
    'South Indian': 'south_indian',
    'Starters': 'starters',
    'Juice': 'juice'
  };
  const categoryKey = categoryKeys[categoryName] || categoryName.toLowerCase();
  const displayCategory = t(categoryKey) !== categoryKey ? t(categoryKey) : categoryName;

  return (
    <>
      <Navbar />
      <div className="category-page-container">
        <header className="category-header-section">
          <h1 className="category-title-main">{displayCategory}</h1>
          <p className="category-subtitle">{t("category_subtitle_prefix")} {displayCategory} {t("category_subtitle_suffix")}</p>
        </header>

        <div className="restaurant-grid-container">
          {restaurants.length > 0 ? (
            <div className="restaurant-grid">
              {restaurants.map((r) => (
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
                    <button
                      className={`fav-toggle-btn ${favorites.has(Number(r.id)) ? 'active' : ''}`}
                      onClick={(e) => toggleFavorite(e, r.id)}
                    >
                      <FiHeart className="heart-icon" />
                    </button>
                  </div>

                  <div className="restaurant-info">
                    <h3 className="restaurant-name">{r.name}</h3>
                    <div className="res-card-meta">
                      <span className="res-card-rating">
                        <FiStar className="star-filled" style={{ fill: "var(--success)", color: "var(--success)" }} /> {r.rating > 0 ? Number(r.rating).toFixed(1) : t("new")}
                      </span>
                      <span className="res-card-dot">•</span>
                      <span className="res-card-time">
                        {(r.r_min ?? 25)}-{(r.r_max ?? 30)} {t("mins") || "MINS"}
                      </span>
                    </div>
                    <p className="restaurant-cuisines">{r.description}</p>
                    <p className="restaurant-location">{getArea(r.location)}...</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-restaurants">
              <img src={NoOrdersImg} alt="No results" />
              <h3>{t("no_restaurants_category")}</h3>
              <button onClick={() => navigate("/")}>{t("explore_all_restaurants")}</button>
            </div>
          )}
        </div>
      </div>
      <FloatingMap />
    </>
  );
};

export default CategoryPage;
