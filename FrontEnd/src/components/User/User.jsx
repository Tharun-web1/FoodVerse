import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../User/Navbar";
import Carousel from "../User/Carousel";
import RestaurantSection from "../User/RestaurantSection";
import Categories from "../User/Categories"
import TopPicks from "../User/TopPicks";
import SearchOverlay from "../User/SearchOverlay";
import FloatingMap from "./FloatingMap";
import "../UserCss/User.css";
import { useTranslation } from "react-i18next";
import { FiFilter } from "react-icons/fi";
import SkeletonLoader from "./SkeletonLoader";
import Loader from "../Common/Loader";
import axios from "axios";
import { API_BASE_URL } from "../../api/api";

const User = () => {
  const { t } = useTranslation();
  const isLoggedIn = !!localStorage.getItem("token");
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const token = localStorage.getItem("token");

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

    if (activeFilters.rating && activeFilters.rating !== 'All') {
      const minRating = parseFloat(activeFilters.rating.split('+')[0]);
      filtered = filtered.filter(r => r.rating >= minRating);
    }

    if (activeFilters.isVeg) {
      filtered = filtered.filter(r => r.isVeg === true);
    }

    setFilteredRestaurants(filtered);
  }, [searchQuery, activeFilters, restaurants]);

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

  return (
    <div className="root">
      <Navbar
        onSearch={setSearchQuery}
        onToggleFilters={() => {
          setIsSearchOpen(true);
          setShowFilters(true);
        }}
        showFilters={showFilters}
        restaurants={restaurants}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Unified Discovery Hub (Merged Search & Filters) */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        restaurants={restaurants}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />

      <Carousel />
      <Categories />
      {/* <div className="home-filters-bar1">
        <h2 className="section-title1">{t('restaurants_near_you')}</h2>
        <div className="filter-actions-group">
            <button className="filter-popup-btn" onClick={() => setShowFilters(true)}>
                {t("filters")} <FiFilter />
            </button>
        </div>
      </div> */}

      {isLoggedIn && <TopPicks favorites={favorites} toggleFavorite={toggleFavorite} />}
      {loading && (
        <div className="container py-5">
          <Loader text={t('loading_restaurants')} />
        </div>
      )}
      {error && <h2>{error}</h2>}
      {!loading && !error && (
        <RestaurantSection
          restaurants={filteredRestaurants}
          onLoadMore={loadMore}
          hasMore={hasMore}
          isLoadingMore={isNextPageLoading}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />

      )}
      {!isLoggedIn && <div className="cta-section">
        <div className="container">
          <h2 className="display-4 fw-bold mb-3">{t("partner_with_us")}</h2>
          <p className="lead mb-4">{t("partner_subtitle")}</p>
          <Link to="/" className="btn btn-lg btn-danger">{t("register_restaurant")}</Link>
        </div>
      </div>}
      <FloatingMap />
    </div>
  );
};

export default User;
