import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Carousel from "../User/Carousel";
import RestaurantSection from "../User/RestaurantSection";
import Categories from "../User/Categories"
import TopPicks from "../User/TopPicks";
import HomeFilterBar from "./HomeFilterBar";
import SearchOverlay from "../User/SearchOverlay";
import LocationSelector from "./LocationSelector";
import ProfileSidebar from "./ProfileSidebar";
import FloatingMap from "./FloatingMap";
import "../UserCss/User.css";
import ExploreMore from "./ExploreMore";
import { useTranslation } from "react-i18next";
import { FiFilter, FiSearch, FiMic, FiCreditCard, FiUser } from "react-icons/fi";
import SkeletonLoader from "./SkeletonLoader";
import Loader from "../Common/Loader";
import axios from "axios";
import { API_BASE_URL } from "../../api/api";

const User = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isLoggedIn = !!localStorage.getItem("token");
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const token = localStorage.getItem("token");
  const [isSticky, setIsSticky] = useState(false);
  const [activeGradient, setActiveGradient] = useState("linear-gradient(135deg, #e11d48 0%, #be123c 60%, #881337 100%)");

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setCurrentUser(res.data))
      .catch(err => console.error("Error loading user info", err));
    }
  }, [token]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchRestaurants = useCallback((pageNum, shouldAppend = true) => {
    if (pageNum > 0) setIsNextPageLoading(true);
    else setLoading(true);

    api
      .get(`/restaurants?page=${pageNum}&size=6`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          if (res.data.length < 6) setHasMore(false);
          else setHasMore(true);

          if (shouldAppend) {
            setRestaurants(prev => {
              // Create a set of existing IDs for performance
              const existingIds = new Set(prev.map(r => r.id));
              // Only add restaurants that are not already in state
              const newItems = res.data.filter(r => !existingIds.has(r.id));
              return [...prev, ...newItems];
            });
          } else {
            setRestaurants(res.data);
          }
        } else {
          setError(t("invalid_data_format"));
        }
        setLoading(false);
        setIsNextPageLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching restaurants:", err);
        setError(t("failed_to_load_restaurants"));
        setLoading(false);
        setIsNextPageLoading(false);
      });
  }, [t]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchRestaurants(0, false);
  }, [fetchRestaurants, activeFilters, searchQuery]);

  const loadMore = () => {
    // Immediate check to prevent multiple concurrent calls for the same page
    if (isNextPageLoading || !hasMore) return;

    const nextPage = page + 1;
    setPage(nextPage);
    fetchRestaurants(nextPage, true);
  };

  const fetchFavorites = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/users/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const favIds = new Set(res.data.map(f => Number(f.restaurantId)));
      setFavorites(favIds);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (e, resId) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!token) return alert(t('login_to_favorite'));

    const numericId = Number(resId);
    // Optimistic update
    setFavorites(prev => {
      const newFavs = new Set(prev);
      if (newFavs.has(numericId)) newFavs.delete(numericId);
      else newFavs.add(numericId);
      return newFavs;
    });

    try {
      await axios.post(`${API_BASE_URL}/users/favorites/toggle/${numericId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Revert if API fails
      setFavorites(prev => {
        const newFavs = new Set(prev);
        if (newFavs.has(numericId)) newFavs.delete(numericId);
        else newFavs.add(numericId);
        return newFavs;
      });
    }
  };

  // Combined filter logic
  useEffect(() => {
    let filtered = [...restaurants];
    const hiddenRes = JSON.parse(localStorage.getItem("hiddenRestaurants") || "[]");

    // 1. Search Logic
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(r => {
        const nameMatch = r.name.toLowerCase().includes(lowerQuery);
        const descMatch = r.discription?.toLowerCase().includes(lowerQuery);
        const locationMatch = r.location?.toLowerCase().includes(lowerQuery);

        // Item/Tag matching: check if any tag exactly matches or contains the query
        const tags = r.discription?.toLowerCase().split(',').map(tag => tag.trim()) || [];
        const tagMatch = tags.some(tag => tag.includes(lowerQuery));

        return nameMatch || descMatch || locationMatch || tagMatch;
      });
      // In search mode, we DON'T filter hidden restaurants as per user request
    } else {
      // 1b. Filter out hidden restaurants when NOT searching
      filtered = filtered.filter(r => !hiddenRes.includes(Number(r.id)));
    }

    // 2. Filter Logic
    if (activeFilters.cuisine && activeFilters.cuisine !== 'All') {
      const lowerCuisine = activeFilters.cuisine.toLowerCase();
      filtered = filtered.filter(r =>
        r.discription?.toLowerCase().includes(lowerCuisine)
      );
    }

    if (activeFilters.rating) {
      if (activeFilters.rating === '4.0+') {
        filtered = filtered.filter(r => (r.rating || 0) >= 4.0);
      } else if (activeFilters.rating === '3.5+') {
        filtered = filtered.filter(r => (r.rating || 0) >= 3.5);
      }
    }

    if (activeFilters.vegOnly || activeFilters.isVeg) {
      filtered = filtered.filter(r => {
        const isCuisineVeg = r.r_cuisine?.toLowerCase().includes('veg');
        const isDescVeg = r.description?.toLowerCase().includes('veg');
        const isNameVeg = r.name?.toLowerCase().includes('veg');
        const hasVegItems = r.items && r.items.length > 0 && r.items.some(item => item.type?.toLowerCase() === 'veg');
        return r.isVeg === true || isCuisineVeg || isDescVeg || isNameVeg || hasVegItems;
      });
    }

    if (activeFilters.offers || activeFilters.hasOffers) {
      if (activeFilters.offerValue) {
        filtered = filtered.filter(r => r.promoOffer && r.promoOffer.toUpperCase().includes(activeFilters.offerValue.toUpperCase()));
      } else {
        filtered = filtered.filter(r => !!r.promoOffer);
      }
    }

    if (activeFilters.time === 'near_fast') {
      filtered = filtered.filter(r => (parseInt(r.r_min) || 25) <= 30);
    }

    // 3. Sorting Logic
    const activeSort = activeFilters.sortBy || sortBy;
    if (activeSort === "delivery" || activeSort === "delivery_time") {
      filtered.sort((a, b) => (parseInt(a.r_min) || 25) - (parseInt(b.r_min) || 25));
    } else if (activeSort === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (activeSort === "price_low_high") {
      filtered.sort((a, b) => (a.price || 150) - (b.price || 150));
    } else if (activeSort === "price_high_low") {
      filtered.sort((a, b) => (b.price || 150) - (a.price || 150));
    }

    setFilteredRestaurants(filtered);
  }, [searchQuery, activeFilters, sortBy, restaurants]);

  // Handle Backend Category Fetching for precise results
  useEffect(() => {
    if (activeFilters.cuisine && activeFilters.cuisine !== 'All') {
      api.get(`/restaurants/category/${activeFilters.cuisine}`)
        .then(res => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            console.log("Backend category results:", res.data);
          }
        })
        .catch(err => console.error("Error fetching category items:", err));
    }
  }, [activeFilters.cuisine]);

  const handleFilterChange = useCallback((filters) => {
    setActiveFilters(filters);
  }, []);

  const handleOfferSelect = useCallback((offerValue) => {
    setActiveFilters(prev => ({
      ...prev,
      hasOffers: true,
      offerValue: prev.offerValue === offerValue && prev.hasOffers ? null : offerValue
    }));
    const element = document.querySelector(".restaurants-and-categories-hub");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleExploreClick = useCallback((filterData) => {
    if (filterData.type === 'veg') {
      setActiveFilters(prev => ({ ...prev, isVeg: !prev.isVeg }));
    } else if (filterData.type === 'rating') {
      setActiveFilters(prev => ({ 
        ...prev, 
        rating: prev.rating === '4' ? '' : '4' 
      }));
    } else if (filterData.type === 'delivery') {
      setSortBy(prev => prev === 'delivery' ? '' : 'delivery');
    } else if (filterData.type === 'offers') {
      setActiveFilters(prev => ({
        ...prev,
        hasOffers: !prev.hasOffers,
        offerValue: null
      }));
    }
  }, []);

  const resetAllFilters = useCallback(() => {
    setActiveFilters({});
    setSearchQuery("");
    setSortBy("");
  }, []);

  const isFilterActive = Boolean(
    searchQuery?.trim() ||
    activeFilters.isVeg ||
    activeFilters.vegOnly ||
    (activeFilters.cuisine && activeFilters.cuisine !== 'All') ||
    activeFilters.rating ||
    activeFilters.time ||
    activeFilters.noPackaging ||
    activeFilters.offers ||
    activeFilters.hasOffers ||
    activeFilters.price ||
    (activeFilters.sortBy && activeFilters.sortBy !== 'relevance') ||
    sortBy
  );

  return (
    <div className="root user-dashboard-root">
      {/* Profile Sidebar Drawer */}
      <ProfileSidebar 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        restaurants={restaurants}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />

      {/* SECTION 1: Dynamic Top Dashboard Header (Location, Wallet, Profile, Search Bar & VEG Toggle) */}
      <div 
        className="dashboard-section-1-header"
        style={{
          background: activeGradient,
          transition: 'background 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="section-1-overlay"></div>
        <div className="section-1-container">
          {/* Row 1: Location on Left, Wallet & Profile on Right */}
          <div className="section-1-top-row">
            <div className="section-1-location">
              <LocationSelector onLocationChange={() => {}} autoDetectOnMobile={true} />
            </div>
            <div className="section-1-actions-right">
              {isLoggedIn && (
                <button 
                  className="section-1-action-btn"
                  onClick={() => navigate('/wallet')}
                  aria-label="View Wallet"
                  title="Bitezy Wallet"
                >
                  <FiCreditCard />
                </button>
              )}
              <button 
                className="section-1-profile-btn"
                onClick={() => {
                  if (isLoggedIn) {
                    setIsProfileOpen(true);
                  } else {
                    navigate("/login/user");
                  }
                }}
                aria-label="View Profile"
                title="My Account"
              >
                <span className="profile-letter-avatar">
                  {(currentUser?.username || localStorage.getItem("username") || "Roy").charAt(0).toUpperCase()}
                </span>
              </button>
            </div>
          </div>

          {/* Row 2: Search Bar & VEG Toggle */}
          <div className={`section-1-search-row ${isSticky ? 'is-sticky' : ''}`}>
            <div className="section-1-search-bar" onClick={() => setIsSearchOpen(true)}>
              <FiSearch className="section-1-search-icon" />
              <input
                type="text"
                placeholder='Search "chatpat..."'
                value={searchQuery}
                readOnly
              />
              <div className="section-1-search-divider"></div>
              <button 
                className="section-1-mic-btn" 
                aria-label="Voice Search"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSearchOpen(true);
                }}
              >
                <FiMic />
              </button>
            </div>

            <div 
              className={`section-1-veg-toggle ${activeFilters.isVeg ? 'active' : ''}`}
              onClick={() => handleFilterChange({ ...activeFilters, isVeg: !activeFilters.isVeg })}
              title="Toggle Pure Veg Only"
            >
              <span className="section-1-veg-label">
                <span className="section-1-veg-dot-icon"></span>
                VEG
              </span>
              <label className="section-1-switch" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={activeFilters.isVeg || false}
                  onChange={(e) => handleFilterChange({ ...activeFilters, isVeg: e.target.checked })}
                />
                <span className="section-1-slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Offers Carousel Banner */}
      <div className="dashboard-section-2-offers">
        <Carousel restaurants={restaurants} onSlideChange={(idx, grad) => setActiveGradient(grad)} onSelectOffer={handleOfferSelect} />
      </div>

      {/* Restaurants & Categories Hub Container */}
      <div className="restaurants-and-categories-hub">
        <div className="sticky-categories-container">
          <Categories />
        </div>

        {/* Quick Filter Bar & Filters Modal (Between Categories and TopPicks) */}
        <HomeFilterBar
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onResetFilters={resetAllFilters}
          resultCount={filteredRestaurants.length}
        />

        {/* When filter is active: hide TopPicks ("Recommended For You") and show Filtered Results at that position */}
        {!isFilterActive ? (
          <TopPicks favorites={favorites} toggleFavorite={toggleFavorite} />
        ) : (
          <RestaurantSection
            title={`${t("filtered_results", "Filtered Results")} (${filteredRestaurants.length})`}
            restaurants={filteredRestaurants}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            showClearFilters={true}
            onClearFilters={resetAllFilters}
          />
        )}

        {/* Restaurants With Us Section - ALWAYS UNFILTERED */}
        {loading && (
          <div className="container py-5">
            <Loader text={t('loading_restaurants')} />
          </div>
        )}
        {error && <h2>{error}</h2>}
        {!loading && !error && (
          <RestaurantSection
            restaurants={restaurants}
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoadingMore={isNextPageLoading}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        )}
      </div>
      {!loading && !error && (
        <ExploreMore 
          onExploreClick={handleExploreClick} 
          activeFilters={activeFilters}
          sortBy={sortBy}
        />
      )}
      {!isLoggedIn && (
        <div className="cta-section">
          <div className="container">
            <h2 className="display-4 fw-bold mb-3">{t("partner_with_us")}</h2>
            <p className="lead mb-4">{t("partner_subtitle")}</p>
            <Link to="/restaurant/signup" className="btn btn-lg btn-danger">{t("register_restaurant")}</Link>
          </div>
        </div>
      )}

      <FloatingMap />
    </div>
  );
};

export default User;
