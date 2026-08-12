import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "../UserCss/OffersPage.css";
import { API_BASE_URL } from "../../api/api";
import FloatingMap from "./FloatingMap";
import { FiArrowLeft, FiHeart, FiStar, FiClock, FiMapPin, FiPercent, FiSearch, FiZap } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import Video25Off from "../../assets/images/offer_25.mp4";
import Video50Off from "../../assets/images/offer_50.mp4";
import Video60Off from "../../assets/images/offer_60.mp4";

const safeDecodeURI = (str) => {
  if (!str) return "all";
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
};

const OffersPage = () => {
  const { t } = useTranslation();
  const { offerType } = useParams();
  const navigate = useNavigate();

  const decodedType = safeDecodeURI(offerType);
  const [selectedOffer, setSelectedOffer] = useState(decodedType);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (offerType) {
      setSelectedOffer(safeDecodeURI(offerType));
    }
  }, [offerType]);

  useEffect(() => {
    if (token) {
      axios
        .get(`${API_BASE_URL}/users/favorites`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          const favIds = new Set(res.data.map((f) => Number(f.restaurantId)));
          setFavorites(favIds);
        })
        .catch((err) => console.error("Error fetching favorites", err));
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/restaurants?page=0&size=50`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setRestaurants(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading restaurants for offers:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let list = [...restaurants];

    // Filter by selected offer percentage
    if (selectedOffer !== "all") {
      const normOffer = selectedOffer.toUpperCase().trim();
      list = list.filter((r) => {
        const promoStr = (r.promoOffer || "").toUpperCase();
        const hasMatchingPromo = promoStr.includes(normOffer);
        const hasMatchingItem = r.items?.some(
          (item) => item.offerActive && `${Math.round(item.discountPercentage)}%`.includes(normOffer)
        );
        return hasMatchingPromo || hasMatchingItem;
      });
    } else {
      // Show all restaurants with any offer
      list = list.filter((r) => !!r.promoOffer || r.items?.some((i) => i.offerActive));
    }

    // Filter by search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.location?.toLowerCase().includes(q) ||
          r.promoOffer?.toLowerCase().includes(q)
      );
    }

    setFilteredRestaurants(list);
  }, [selectedOffer, search, restaurants]);

  const toggleFavorite = async (e, resId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return alert(t("login_to_favorite", "Please login to add favorites"));

    setFavorites((prev) => {
      const newFavs = new Set(prev);
      if (newFavs.has(resId)) newFavs.delete(resId);
      else newFavs.add(resId);
      return newFavs;
    });

    try {
      await axios.post(
        `${API_BASE_URL}/users/favorites/toggle/${resId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error toggling favorite", err);
      setFavorites((prev) => {
        const newFavs = new Set(prev);
        if (newFavs.has(resId)) newFavs.delete(resId);
        else newFavs.add(resId);
        return newFavs;
      });
    }
  };

  const getVideoForOffer = (offer) => {
    if (offer.includes("50")) return Video50Off;
    if (offer.includes("60")) return Video60Off;
    return Video25Off;
  };

  const getDistanceText = (r) => {
    try {
      const savedUserLoc = localStorage.getItem("userLocation");
      if (savedUserLoc && r?.r_lat && r?.r_lon) {
        const userLoc = JSON.parse(savedUserLoc);
        const uLat = parseFloat(userLoc.lat);
        const uLng = parseFloat(userLoc.lng);
        const rLat = parseFloat(r.r_lat);
        const rLng = parseFloat(r.r_lon);

        if (!isNaN(uLat) && !isNaN(uLng) && !isNaN(rLat) && !isNaN(rLng)) {
          const R = 6371;
          const dLat = (rLat - uLat) * (Math.PI / 180);
          const dLon = (rLng - uLng) * (Math.PI / 180);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(uLat * (Math.PI / 180)) *
            Math.cos(rLat * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const dist = R * c;
          return dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
        }
      }
    } catch (e) {
      console.error("Error calculating distance:", e);
    }
    const numId = Number(r.id) || 1;
    return `${(1.5 + ((numId * 7) % 25) / 10).toFixed(1)} km`;
  };

  const offerFilterChips = [
    { label: "All Offers", value: "all" },
    { label: "25% OFF", value: "25%" },
    { label: "50% OFF", value: "50%" },
    { label: "60% OFF", value: "60%" }
  ];

  return (
    <>
      <Navbar />
      <div className="offers-page-root">
        {/* HEADER TOP BAR */}
        <div className="offers-header-bar">
          <button className="offers-back-btn" onClick={() => navigate("/user")}>
            <FiArrowLeft />
          </button>
          <div className="offers-header-title-group">
            <h1>
              {selectedOffer === "all"
                ? "Exclusive Food Offers"
                : `Special ${selectedOffer} OFF Deals`}
            </h1>
            <p>Save big on your favorite restaurants with verified coupons</p>
          </div>
        </div>

        {/* SEARCH BAR ROW */}
        <div className="offers-filter-section">
          <div className="offers-search-box">
            <FiSearch className="offers-search-icon" />
            <input
              type="text"
              placeholder="Search offer restaurants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="offers-search-clear" onClick={() => setSearch("")}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* RESTAURANTS GRID SECTION */}
        <div className="offers-content-container">
          {loading ? (
            <div className="offers-loading-grid">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="offers-skeleton-card" />
              ))}
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="offers-empty-state animate__animated animate__fadeIn">
              <div className="offers-empty-icon-circle">
                <FiPercent />
              </div>
              <h3>No matching offer restaurants found</h3>
              <p>Try switching to another offer filter to discover top discounts near you!</p>
              <button
                className="offers-explore-all-btn"
                onClick={() => {
                  setSelectedOffer("all");
                  setSearch("");
                  navigate("/offers/all");
                }}
              >
                View All Offers
              </button>
            </div>
          ) : (
            <div className="offers-cards-grid">
              {filteredRestaurants.map((res) => (
                <div
                  key={res.id}
                  className="offers-res-card animate__animated animate__fadeIn"
                  onClick={() => navigate(`/restaurant/${res.id}`)}
                >
                  <div className="offers-card-image-wrap">
                    <img
                      src={`${API_BASE_URL}/restaurants/${res.id}/image`}
                      alt={res.name}
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop";
                      }}
                    />

                    {/* PROMO BADGE OVERLAY */}
                    {res.promoOffer && (
                      <div className="offers-promo-badge">
                        <FiZap className="zap-badge-icon" />
                        <span>{res.promoOffer}</span>
                      </div>
                    )}

                    {/* FAVORITE BUTTON */}
                    <button
                      className={`offers-fav-btn ${favorites.has(Number(res.id)) ? "active" : ""}`}
                      onClick={(e) => toggleFavorite(e, Number(res.id))}
                    >
                      <FiHeart className="heart-icon" />
                    </button>
                  </div>

                  <div className="offers-card-body">
                    <div className="offers-card-header-row">
                      <h3 className="offers-res-name">{res.name}</h3>
                      <div className="offers-rating-pill">
                        <FiStar className="star-icon" />
                        <span>{res.rating > 0 ? res.rating.toFixed(1) : "NEW"}</span>
                      </div>
                    </div>

                    <p className="offers-cuisine-text">{res.r_cuisine || res.description || "Multi Cuisine"}</p>

                    <div className="offers-card-meta-row">
                      <div className="offers-meta-item">
                        <FiClock className="meta-icon" />
                        <span>
                          {res.r_min || res.r_max ? `${res.r_min || 25}-${res.r_max || 30} MINS` : "25-30 MINS"}
                        </span>
                      </div>
                      <span className="meta-dot">•</span>
                      <div className="offers-meta-item">
                        <FiMapPin className="meta-icon" />
                        <span>{getDistanceText(res)}</span>
                      </div>
                    </div>

                    <div className="offers-card-footer">
                      <span className="offers-location-name">{res.location || "Nearby"}</span>
                      <span className="offers-view-deal">View Deal →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <FloatingMap />
      </div>
    </>
  );
};

export default OffersPage;
