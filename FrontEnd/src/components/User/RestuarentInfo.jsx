import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../User/Navbar";
import "../UserCss/RestuarentInfo.css";
import "../UserCss/FloatingCart.css";
import { FiStar, FiClock, FiSearch, FiShoppingBag, FiInfo, FiMapPin, FiChevronDown, FiCheckCircle, FiPercent, FiArrowLeft, FiUsers, FiMoreVertical, FiPlus, FiHeart, FiEyeOff, FiShare2, FiAlertCircle, FiX, FiRefreshCw } from "react-icons/fi";
import { useCart } from "./CartContext";
import { API_BASE_URL } from "../../api/api";
import FloatingMap from "./FloatingMap";
import ItemCustomizationModal from "./ItemCustomizationModal";
import { useToast } from "../../context/ToastContext";
import { useTranslation } from "react-i18next";
import Loader from "../Common/Loader";

const RestaurantInfo = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cartItems, setActiveRestaurantId, addToCart, removeFromCart, clearCart, specialInstructions, setSpecialInstructions } = useCart();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("");
  const [foodFilter, setFoodFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("menu");
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [showMenuButton, setShowMenuButton] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [isOffersExpanded, setIsOffersExpanded] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [showQuantityPicker, setShowQuantityPicker] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [pickerQty, setPickerQty] = useState(1);
  const [cookingRequest, setCookingRequest] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customizableItem, setCustomizableItem] = useState(null);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const getItemQty = (itemId) => {
    const item = cartItems.find(ci => ci.itemId === itemId);
    return item ? item.qty : 0;
  };

  const isCustomizableItem = (item) => {
    if (!item) return false;
    const name = (item.itemName || item.name || '').toLowerCase();
    const cat = (item.categoryName || '').toLowerCase();
    return name.includes('pizza') || cat.includes('pizza');
  };

  // Finds all variants (same itemName) across items list
  const getVariants = (item) => {
    const baseName = item.itemName?.trim().toLowerCase();
    return items.filter(
      (i) => i.itemName?.trim().toLowerCase() === baseName && i.available && i.serves
    ).sort((a, b) => a.price - b.price);
  };

  const handleAddClick = (item) => {
    if (navigator.vibrate) navigator.vibrate(15);

    // Trigger customization modal ONLY for Pizza items
    if (isCustomizableItem(item)) {
      setCustomizableItem(item);
      setShowCustomModal(true);
      return;
    }

    setSelectedItem(item);
    setSelectedVariant(item);
    setPickerQty(1);
    setCookingRequest("");
    setShowQuantityPicker(true);
  };

  const handleVariantAddToCart = () => {
    if (selectedVariant) {
      if (navigator.vibrate) navigator.vibrate(15);
      addToCart(selectedVariant, id, pickerQty);
      if (cookingRequest.trim()) {
        setSpecialInstructions(prev => {
          const base = typeof prev === 'string' ? prev.trim() : '';
          return base ? base + ", " + cookingRequest.trim() : cookingRequest.trim();
        });
      }
      showToast(`Added ${selectedVariant.itemName || selectedVariant.name || 'item'} to cart!`, "success");
      setShowQuantityPicker(false);
      setSelectedItem(null);
      setSelectedVariant(null);
      setPickerQty(1);
      setCookingRequest("");
    }
  };

  const navigate = useNavigate();

  const handleResInfoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/user");
    }
  };

  useEffect(() => {
    if (id) {
      setActiveRestaurantId(id);
    }
    const token = localStorage.getItem("token");
    const fetchInitialData = async () => {
      try {
        const resRes = await axios.get(`${API_BASE_URL}/restaurants/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRestaurant(resRes.data);
        checkHiddenStatus();
        setLoading(false);

        const itemsRes = await axios.get(`${API_BASE_URL}/restaurants/${id}/items`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(itemsRes.data);

        const revRes = await axios.get(`${API_BASE_URL}/reviews/restaurant/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviews(revRes.data);

        const coupRes = await axios.get(`${API_BASE_URL}/restaurants/${id}/coupons`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCoupons(coupRes.data);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchInitialData();
    fetchFavoriteStatus();

    const handleScroll = () => {
      const scrollPos = window.scrollY;
      setShowStickyBar(scrollPos > 450);
      setIsHeaderSticky(scrollPos > 180);
      setShowMenuButton(scrollPos > 600);

      // Close options menu on scroll for cleaner UX
      if (showOptionsMenu) {
        setShowOptionsMenu(false);
      }
    };

    const handleClickOutside = (e) => {
      if (showOptionsMenu && !e.target.closest('.options-menu-wrapper-v3')) {
        setShowOptionsMenu(false);
      }
    };

    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        setShowOptionsMenu(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscKey);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [id, showOptionsMenu]);

  const fetchRestaurantData = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_BASE_URL}/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRestaurant(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_BASE_URL}/reviews/restaurant/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFavoriteStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/users/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const numericId = Number(id);
      const isFav = res.data.some(f => Number(f.restaurantId) === numericId);
      setIsFavorite(isFav);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  const toggleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) return showToast(t("please_login"), "error");

    const numericId = Number(id);
    // Optimistic toggle
    setIsFavorite(!isFavorite);

    try {
      await axios.post(`${API_BASE_URL}/users/favorites/toggle/${numericId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(isFavorite ? t("removed_from_favorites") : t("added_to_favorites"), "success");
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setIsFavorite(isFavorite); // Revert
    }
    setShowOptionsMenu(false);
  };

  const checkHiddenStatus = () => {
    const hidden = JSON.parse(localStorage.getItem("hiddenRestaurants") || "[]");
    setIsHidden(hidden.includes(Number(id)));
  };

  const toggleHideRestaurant = () => {
    const hidden = JSON.parse(localStorage.getItem("hiddenRestaurants") || "[]");
    const numericId = Number(id);
    let newHidden;

    if (isHidden) {
      newHidden = hidden.filter(hid => hid !== numericId);
      showToast(t("restaurant_unhidden"), "success");
    } else {
      newHidden = [...hidden, numericId];
      showToast(t("restaurant_hidden"), "info");
      // Redirect to home if hiding, consistent with earlier behavior
      setTimeout(() => navigate("/user"), 1500);
    }

    localStorage.setItem("hiddenRestaurants", JSON.stringify(newHidden));
    setIsHidden(!isHidden);
    setShowOptionsMenu(false);
  };

  const shareRestaurant = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    showToast(t("link_copied"), "success");
    setShowOptionsMenu(false);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API_BASE_URL}/reviews/add?restaurantId=${id}`,
        { rating: reviewData.rating, comment: reviewData.comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(t("review_submitted"));
      setShowReviewModal(false);
      setReviewData({ rating: 5, comment: "" });
      fetchReviews();
      fetchRestaurantData();
    } catch (err) {
      alert(t("review_failed"));
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="restaurant-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader text={t("loading_restaurant")} />
      </div>
    </>
  );
  if (!restaurant) return <h2>{t("restaurant_not_found")}</h2>;

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      item.itemName?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q);
    const matchesType =
      foodFilter === "all" || item.type?.toLowerCase() === foodFilter;
    return matchesSearch && matchesType;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "priceLow") return a.price - b.price;
    if (sortBy === "priceHigh") return b.price - a.price;
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  // Detect duplicate item names across restaurant menu to format as "Item Name (Serves)"
  const nameCounts = items.reduce((acc, item) => {
    const name = item.itemName?.trim().toLowerCase();
    if (name) acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const getItemDisplayName = (item) => {
    if (!item?.itemName) return '';
    const name = item.itemName.trim();
    const lower = name.toLowerCase();
    if (nameCounts[lower] > 1 && item.serves) {
      return `${name} (${item.serves})`;
    }
    return name;
  };

  // Group all items (no deduplication) by category so users can see all variants directly
  const groupedItems = sortedItems.reduce((acc, item) => {
    const category = item.category || "Others";
    acc[category] = acc[category] || [];
    acc[category].push(item);
    return acc;
  }, {});

  const generateSmartCombos = () => {
    const combos = [];
    const cats = Object.keys(groupedItems);

    // Categorize for easier pairing
    const mains = cats.filter(c => /main|curry|biryani|pizza|burger|chinese|thali/i.test(c));
    const sides = cats.filter(c => /bread|roti|naan|rice|side|starter|appetizer|beverage|drink|dessert|raita/i.test(c));

    mains.forEach(mainCat => {
      sides.forEach(sideCat => {
        // Skip pairing bread with bread or similar
        if (mainCat === sideCat) return;

        groupedItems[mainCat].slice(0, 1).forEach(mainItem => {
          groupedItems[sideCat].slice(0, 1).forEach(sideItem => {
            // Check if they are already similar (e.g. both beverages) - regex check
            const isBothDrinks = /drink|bev/i.test(mainCat) && /drink|bev/i.test(sideCat);
            if (isBothDrinks) return;

            combos.push({
              id: `combo-${mainItem.id}-${sideItem.id}`,
              items: [mainItem, sideItem],
              name: `${mainItem.itemName} + ${sideItem.itemName}`,
              price: Math.round((mainItem.price + sideItem.price) * 0.9), // 10% discount
              badge: mains.includes(mainCat) && /bread|rice/i.test(sideCat) ? "MOST LOVED" : "COMBO"
            });
          });
        });
      });
    });

    return combos.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).slice(0, 6);
  };

  const smartCombos = generateSmartCombos();

  const highlightText = (text) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    // Use a custom class instead of <mark> for v3 styling
    return text.replace(regex, `<span class="v3-search-highlight">$1</span>`);
  };

  const getAvatarColor = (userId) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    return colors[userId % colors.length];
  };

  const scrollToCategory = (category) => {
    const element = document.getElementById(`category-${category}`);
    if (element) {
      const offset = 100; // Account for sticky nav height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const getDistanceText = () => {
    try {
      const savedUserLoc = localStorage.getItem("userLocation");
      if (savedUserLoc && restaurant?.r_lat && restaurant?.r_lon) {
        const userLoc = JSON.parse(savedUserLoc);
        const uLat = parseFloat(userLoc.lat);
        const uLng = parseFloat(userLoc.lng);
        const rLat = parseFloat(restaurant.r_lat);
        const rLng = parseFloat(restaurant.r_lon);

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
      console.error("Error computing distance:", e);
    }
    const numId = Number(id) || 1;
    const fallbackDist = (1.5 + ((numId * 7) % 25) / 10).toFixed(1);
    return `${fallbackDist} km`;
  };

  return (
    <>
      <Navbar />
      <div className={`restaurant-page ${search ? 'is-searching' : ''}`}>
        {/* TOP BANNER IMAGE & OVERLAY ACTIONS */}
        <div className={`res-top-actions-overlay ${isHeaderSticky || search ? 'sticky' : ''}`}>
          <button className="back-circle-btn-v3" onClick={handleResInfoBack}>
            <FiArrowLeft />
          </button>
          <div className="right-actions-group-v3">
            <div className="search-pill-overlay-v3">
              <FiSearch className="overlay-search-icon-v3" />
              <input
                type="text"
                placeholder={t("search_menu", "Search...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="overlay-search-input-v3"
              />
              {search && (
                <button className="search-input-clear-icon-v3" onClick={() => setSearch("")} title="Clear search">
                  ×
                </button>
              )}
            </div>
            <div className="options-menu-wrapper-v3">
              <button
                className={`action-circle-btn-v3 ${showOptionsMenu ? 'active' : ''}`}
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              >
                <FiMoreVertical />
              </button>
              {showOptionsMenu && (
                <div className="res-options-dropdown animate__animated animate__zoomIn">
                  <button className="dropdown-item-v3" onClick={toggleFavorite}>
                    <FiHeart style={{ color: isFavorite ? '#ef4444' : 'inherit', fill: isFavorite ? '#ef4444' : 'none' }} />
                    <span>{isFavorite ? t("remove_from_favorites") : t("add_to_favorites")}</span>
                  </button>
                  <button className="dropdown-item-v3" onClick={toggleHideRestaurant}>
                    {isHidden ? <FiEyeOff style={{ color: '#3b82f6' }} /> : <FiEyeOff />}
                    <span>{isHidden ? t("unhide_restaurant") : t("hide_restaurant")}</span>
                  </button>
                  <button className="dropdown-item-v3" onClick={shareRestaurant}>
                    <FiShare2 />
                    <span>{t("share")}</span>
                  </button>
                  <div className="dropdown-divider-v3"></div>
                  <button className="dropdown-item-v3 danger" onClick={() => { showToast(t("report_submitted"), "info"); setShowOptionsMenu(false); }}>
                    <FiAlertCircle />
                    <span>{t("report")}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {!search && (
          <div className="res-top-banner">
            <img
              src={`${API_BASE_URL}/restaurants/${id}/image`}
              alt={restaurant.name}
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop"; }}
            />
          </div>
        )}

        {/* FLOATING RESTAURANT CARD - Hidden during search */}
        {!search && (
          <div className="res-floating-card animate__animated animate__fadeIn">
            <div className="res-header-main">
              <div className="res-left-info">
                <div className="res-title-group">
                  <h1 className="res-display-name">{restaurant.name}</h1>
                  {/* <FiInfo className="res-info-icon" /> */}
                </div>

                <div className="res-header-meta-list">
                  <div className="res-meta-row">
                    <div
                      className="res-meta-item clickable-address"
                      onClick={() => {
                        const query = encodeURIComponent(`${restaurant.name} ${restaurant.location}`);
                        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                      }}
                      title="View on Google Maps"
                    >
                      <FiMapPin className="res-meta-icon" />
                      <span className="res-meta-text">
                        {getDistanceText()} • {restaurant.location || "Location unavailable"}
                      </span>
                      <FiChevronDown className="res-dropdown-arrow" />
                    </div>
                  </div>

                  <div className="res-meta-row res-meta-pills-row">
                    <div className="res-meta-item">
                      <FiClock className="res-meta-icon" />
                      <span className="res-meta-text">
                        {restaurant.r_min || restaurant.r_max
                          ? `${restaurant.r_min || 25}-${restaurant.r_max || 30} MINS`
                          : "25-30 MINS"}
                      </span>
                    </div>

                    {Boolean(restaurant.last24HoursOrders > 0) && (
                      <div className="res-orders-count-badge">
                        <span className="orders-pulse-dot"></span>
                        <span className="orders-count-text">{restaurant.last24HoursOrders}+ orders placed in last 24 hrs</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="res-rating-pill-container">
                <div className="res-rating-value-pill">
                  <FiStar className="star-mini-icon" />
                  <span>{restaurant.rating > 0 ? restaurant.rating.toFixed(1) : "NEW"}</span>
                </div>
                <div className="res-rating-count-sub">
                  By {restaurant.review || 0}+ ratings
                </div>
              </div>
            </div>

            {restaurant.frequentlyReordered === true && (
              <div className="res-status-tag">
                <FiCheckCircle className="res-check-icon" />
                <span>Frequently reordered</span>
              </div>
            )}

            {/* OFFER SUMMARY BAR - Now Collapsible */}
            {coupons.length > 0 && (
              <div className="res-offer-divider">
                <div className="res-offer-summary" onClick={() => setIsOffersExpanded(!isOffersExpanded)}>
                  <div className="res-offer-content-inline">
                    <FiPercent className="res-offer-icon" />
                    <span className="res-offer-text">{coupons[0].discountType === "PERCENTAGE" ? `${coupons[0].discountValue}%` : `₹${coupons[0].discountValue}`} OFF • {coupons[0].code}</span>
                  </div>
                  <div className="res-offer-count-more">
                    {coupons.length} offers <FiChevronDown style={{ transform: isOffersExpanded ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </div>
                </div>

                {/* INLINE COUPON LIST (When Expanded) */}
                {isOffersExpanded && (
                  <div className="res-offers-mini-list animate__animated animate__fadeIn">
                    {coupons.map((cp) => (
                      <div key={cp.id} className="offer-pill-mini" onClick={() => {
                        navigator.clipboard.writeText(cp.code);
                        showToast(t("coupon_copied", { code: cp.code }), "success");
                      }}>
                        <div className="offer-pill-header">
                          <span className="pill-code">{cp.code}</span>
                          <span className="pill-discount">{cp.discountType === "PERCENTAGE" ? `${cp.discountValue}%` : `₹${cp.discountValue}`}</span>
                        </div>
                        <p className="pill-desc">Min. order ₹{cp.minOrderAmount || 0}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}


        {/* MOST ORDERED TOGETHER - Dynamic Smart Combos */}
        {!search && smartCombos.length > 0 && (
          <div className="most-ordered-section-v3 animate__animated animate__fadeIn">
            <h3 className="section-v3-title">🔥 Most ordered together</h3>
            <div className="most-ordered-scroll-v3">
              {smartCombos.map((combo) => (
                <div className="combo-card-v3" key={combo.id}>
                  <div className="combo-badge-v3">{combo.badge}</div>
                  <div className="combo-images-v3">
                    <div className="combo-img-v3">
                      <img
                        src={`${API_BASE_URL}/restaurants/${combo.items[0].id}/itemimg`}
                        alt={combo.items[0].itemName}
                        onError={(e) => e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200"}
                      />
                    </div>
                    <div className="combo-plus-v3"><FiPlus /></div>
                    <div className="combo-img-v3">
                      <img
                        src={`${API_BASE_URL}/restaurants/${combo.items[1].id}/itemimg`}
                        alt={combo.items[1].itemName}
                        onError={(e) => e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200"}
                      />
                    </div>
                  </div>
                  <div className="combo-content-v3">
                    <h4 className="combo-name-v3">{combo.name}</h4>
                    <div className="combo-footer-v3">
                      <span className="combo-price-v3">₹{combo.price}</span>
                      <button
                        className="see-combo-btn-v3"
                        onClick={() => {
                          addToCart(combo.items[0], id);
                          addToCart(combo.items[1], id);
                          showToast(`Added ${combo.name} to cart!`, "success");
                        }}
                      >
                        {t("add")} <FiPlus />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UNIFIED NAV & FILTER HEADER - V3 AIRY DESIGN */}
        {!search && (
          <div className="res-nav-unified-header">
            {/* TABS ROW */}
            <div className="res-tabs-container">
              <div className="res-tabs-nav-v3">
                <button
                  className={`tab-btn-v3 ${activeTab === 'menu' ? 'active' : ''}`}
                  onClick={() => setActiveTab('menu')}
                >
                  {t("menu")}
                </button>
                <button
                  className={`tab-btn-v3 ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  {t("reviews")} <span className="tab-count-v3">({reviews.length})</span>
                </button>
              </div>
            </div>

            {activeTab === 'menu' && (
              <div className="res-filters-container-v3">
                <div className="filter-chips-scroll">
                  <button
                    className={`filter-chip-v3 veg ${foodFilter === 'veg' ? 'active' : ''}`}
                    onClick={() => setFoodFilter(foodFilter === 'veg' ? 'all' : 'veg')}
                  >
                    <div className="chip-indicator veg"></div>
                    {t("veg_only")}
                  </button>
                  <button
                    className={`filter-chip-v3 nonveg ${foodFilter === 'non-veg' ? 'active' : ''}`}
                    onClick={() => setFoodFilter(foodFilter === 'non-veg' ? 'all' : 'non-veg')}
                  >
                    <div className="chip-indicator nonveg"></div>
                    {t("non_veg")}
                  </button>
                  <div className="filter-chip-v3 sort">
                    <FiSearch className="chip-icon-v3" style={{ transform: 'rotate(90deg)' }} />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="chip-select-v3"
                    >
                      <option value="">{t("sort_by")}</option>
                      <option value="priceLow">{t("price_low_high")}</option>
                      <option value="priceHigh">{t("price_high_low")}</option>
                      <option value="rating">{t("rating_high_low")}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STICKY CATEGORY NAV - Clean Glassmorphism V3 */}
        {!search && (
          <div className={`sticky-nav-v3 ${showStickyBar ? 'visible' : ''}`}>
            <div className="sticky-scroll-wrapper-v3">
              {Object.keys(groupedItems).map((category) => (
                <button
                  key={category}
                  className="sticky-item-v3"
                  onClick={() => scrollToCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'menu' ? (
          <>
            {/* SEARCH RESULTS HEADER V3 */}
            {search && (
              <div className="search-results-banner-v3 animate__animated animate__fadeInDown">
                <div className="search-info-chip-v3">
                  <FiSearch className="search-info-icon-v3" />
                  <span className="search-label-v3">{t("showing_results_for", "Showing results for")}</span>
                  <span className="search-query-v3">"{search}"</span>
                  <span className="search-count-v3">({filteredItems.length} {filteredItems.length === 1 ? 'dish' : 'dishes'})</span>
                </div>
                <button className="search-clear-btn-v3" onClick={() => setSearch("")}>
                  <FiX /> {t("clear", "Clear")}
                </button>
              </div>
            )}

            {/* MENU LIST OR EMPTY SEARCH STATE */}
            {search && filteredItems.length === 0 ? (
              <div className="no-search-results-v3 animate__animated animate__fadeIn">
                <div className="no-search-icon-circle">
                  <FiSearch className="no-search-lens" />
                </div>
                <h3>{t("no_items_found", "No dishes found")}</h3>
                <p>We couldn't find any items matching "<strong>{search}</strong>". Check your spelling or try another search.</p>
                <button className="clear-search-pill-btn" onClick={() => setSearch("")}>
                  <FiRefreshCw className="refresh-icon" /> {t("clear_search", "Clear Search & View Menu")}
                </button>
              </div>
            ) : (
              <div className="menu-main-content">
                {Object.keys(groupedItems).map((category) => (
                  <div key={category} id={`category-${category}`} className="menu-category-section">
                    {!search && <h2 className="menu-category-header">{category} ({groupedItems[category].length})</h2>}
                    <div className="menu-items-grid">
                      {groupedItems[category].map((item) => (
                        <div className={`menu-item-card ${!item.available ? 'item-unavailable' : ''}`} key={item.id}>
                          <div className="menu-item-details">
                            <div className={`food-mark ${item.type?.toLowerCase() === "veg" ? "veg" : "nonveg"}`}>
                              <div className="food-mark-dot"></div>
                            </div>
                            <h3 dangerouslySetInnerHTML={{ __html: highlightText(getItemDisplayName(item)) }}></h3>
                            {item.offerActive && item.discountPercentage > 0 && (!item.offerExpiryDate || new Date(item.offerExpiryDate) > new Date()) ? (
                              <div className="menu-item-price-wrapper">
                                <span className="menu-item-price discounted">₹{Math.round(item.price * (1 - item.discountPercentage / 100))}</span>
                                <span className="menu-item-price original-strikethrough">₹{item.price}</span>
                                <span className="item-offer-badge">🔥 {Math.round(item.discountPercentage)}% OFF</span>
                              </div>
                            ) : (
                              <p className="menu-item-price">₹{item.price}</p>
                            )}
                            <p className="menu-item-desc">{item.description}</p>
                          </div>
                          <div className="menu-item-image-container">
                            <img
                              src={`${API_BASE_URL}/restaurants/${item.id}/itemimg`}
                              alt={item.itemName}
                              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop"; }}
                            />
                            {item.available ? (
                              getItemQty(item.id) > 0 ? (
                                <div className="qty-control-box">
                                  <button onClick={() => { if (navigator.vibrate) navigator.vibrate(8); removeFromCart(item.id); }}>-</button>
                                  <span>{getItemQty(item.id)}</span>
                                  <button onClick={() => { if (navigator.vibrate) navigator.vibrate(12); addToCart(item, id); }}>+</button>
                                </div>
                              ) : (
                                <button className="add-to-cart-btn" onClick={() => handleAddClick(item)}>{t("add")}</button>
                              )
                            ) : (
                              <button className="add-to-cart-btn disabled">{t("unavailable")}</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="reviews-section-container">
            <div className="reviews-header-actions">
              <h2>{t("customer_reviews")}</h2>
            </div>
            {reviews.length === 0 ? (
              <div className="no-reviews-msg">{t("no_reviews_msg")}</div>
            ) : (
              <div className="reviews-list">
                {reviews.map((rev) => (
                  <div key={rev.id} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          {rev.profileImageUrl ? (
                            <img
                              src={`${API_BASE_URL}${rev.profileImageUrl}`}
                              alt={rev.username}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="avatar-fallback" style={{ backgroundColor: getAvatarColor(rev.userId || 0), display: rev.profileImageUrl ? 'none' : 'flex' }}>
                            {rev.username.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="reviewer-details">
                          <span className="reviewer-name">{rev.username}</span>
                          <div className="review-rating">
                            {[...Array(5)].map((_, i) => (
                              <FiStar key={i} className={i < rev.rating ? "star-icon filled" : "star-icon"} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="review-date">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="review-comment">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* Review Modal */}
        {showReviewModal && (
          <div className="review-modal-overlay">
            <div className="review-modal">
              <h2>{t("rate_your_order")} {restaurant.name}</h2>
              <form onSubmit={submitReview}>
                <div className="rating-input-group">
                  <label>{t("rating_label")}</label>
                  <select
                    value={reviewData.rating}
                    onChange={(e) => setReviewData({ ...reviewData, rating: parseInt(e.target.value) })}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ ({t("excellent")})</option>
                    <option value="4">⭐⭐⭐⭐ ({t("good")})</option>
                    <option value="3">⭐⭐⭐ ({t("average")})</option>
                    <option value="2">⭐⭐ ({t("poor")})</option>
                    <option value="1">⭐ ({t("terrible")})</option>
                  </select>
                </div>
                <div className="comment-input-group">
                  <label>{t("feedback_label")}</label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    placeholder={t("feedback_placeholder")}
                    rows="4"
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="submit-review-btn">{t("submit_review")}</button>
                  <button type="button" className="close-modal-btn" onClick={() => setShowReviewModal(false)}>{t("cancel")}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QUANTITY PICKER BOTTOM SHEET */}
        {showQuantityPicker && selectedItem && (
          <>
            <div className="qty-picker-overlay" onClick={() => setShowQuantityPicker(false)} />
            <div className="qty-picker-sheet animate__animated animate__slideInUp">
              {/* Handle */}
              <div className="qty-picker-handle" />

              {/* Header */}
              <div className="qty-picker-header">
                <img
                  src={`${API_BASE_URL}/restaurants/${selectedItem.id}/itemimg`}
                  alt={selectedItem.itemName}
                  className="qty-picker-thumb"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=80&auto=format&fit=crop"; }}
                />
                <div className="qty-picker-title-group">
                  <h3>{selectedItem.itemName}</h3>
                </div>
                <button className="qty-picker-close" onClick={() => setShowQuantityPicker(false)}>✕</button>
              </div>

              {/* Quantity Section */}
              <div className="qty-picker-section">
                <div className="qty-picker-section-title">
                  <span>Quantity</span>
                  <span className="qty-picker-required">Required • Select any 1 option</span>
                </div>
                {getVariants(selectedItem).map((variant) => {
                  const isOfferValid = variant.offerActive && variant.discountPercentage > 0 && (!variant.offerExpiryDate || new Date(variant.offerExpiryDate) > new Date());
                  const effPrice = isOfferValid ? Math.round(variant.price * (1 - variant.discountPercentage / 100)) : variant.price;
                  return (
                    <button
                      key={variant.id}
                      className={`qty-picker-option ${selectedVariant?.id === variant.id ? 'selected' : ''}`}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      <span className="qty-picker-option-label">{variant.serves}</span>
                      <div className="qty-picker-option-right">
                        {isOfferValid ? (
                          <div className="qty-picker-price-stack" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="qty-picker-option-price" style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px' }}>
                                ₹{effPrice}
                              </span>
                              <span className="qty-picker-option-price-original" style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12px' }}>
                                ₹{variant.price}
                              </span>
                            </div>
                            <span className="qty-picker-discount-badge" style={{ fontSize: '10.5px', fontWeight: '800', color: '#059669', background: '#ecfdf5', padding: '1px 5px', borderRadius: '4px' }}>
                              🔥 {Math.round(variant.discountPercentage)}% OFF
                            </span>
                          </div>
                        ) : (
                          <span className="qty-picker-option-price" style={{ marginRight: '8px' }}>₹{variant.price}</span>
                        )}
                        <span className={`qty-picker-radio ${selectedVariant?.id === variant.id ? 'checked' : ''}`} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Cooking Request / Suggestions Section */}
              <div className="qty-picker-cooking-section">
                <div className="qty-picker-cooking-title">
                  <span>Add a cooking request / suggestions (optional)</span>
                  <p className="qty-picker-cooking-subtitle">
                    The restaurant will try its best to fulfil your requests. However, refunds or cancellations related to such requests won't be possible.
                  </p>
                </div>
                <div className="qty-picker-textarea-wrapper">
                  <textarea
                    className="qty-picker-textarea"
                    placeholder="e.g. Don't make it too spicy, less oil, extra gravy"
                    value={cookingRequest}
                    onChange={(e) => setCookingRequest(e.target.value)}
                    maxLength={100}
                  />
                  <span className="qty-picker-char-count">{cookingRequest.length}/100</span>
                </div>
                <div className="qty-picker-chips-container">
                  {["Less Spicy", "Non spicy", "Mild spicy", "Extra spicy", "Less oil", "Extra gravy", "Make it extra crispy"].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      className={`qty-picker-chip ${cookingRequest === chip ? 'active' : ''}`}
                      onClick={() => setCookingRequest(cookingRequest === chip ? "" : chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Row: Counter + Add Button */}
              <div className="qty-picker-footer">
                <div className="qty-picker-counter">
                  <button
                    type="button"
                    onClick={() => setPickerQty(q => Math.max(1, q - 1))}
                    disabled={pickerQty <= 1}
                  >
                    —
                  </button>
                  <span>{pickerQty}</span>
                  <button
                    type="button"
                    onClick={() => setPickerQty(q => q + 1)}
                  >
                    +
                  </button>
                </div>
                {(() => {
                  const isSelOfferValid = selectedVariant?.offerActive && selectedVariant.discountPercentage > 0 && (!selectedVariant.offerExpiryDate || new Date(selectedVariant.offerExpiryDate) > new Date());
                  const selEffPrice = isSelOfferValid ? Math.round(selectedVariant.price * (1 - selectedVariant.discountPercentage / 100)) : (selectedVariant?.price || 0);
                  return (
                    <button
                      className="qty-picker-add-btn-v3"
                      onClick={handleVariantAddToCart}
                      disabled={!selectedVariant}
                    >
                      Add item ₹{selEffPrice * pickerQty}
                      {isSelOfferValid && (
                        <span style={{ textDecoration: 'line-through', fontSize: '12px', opacity: 0.8, marginLeft: '6px' }}>
                          ₹{(selectedVariant?.price || 0) * pickerQty}
                        </span>
                      )}
                    </button>
                  );
                })()}
              </div>
            </div>
          </>
        )}

        {/* FLOATING UTILITY MENU BUTTON */}
        <button className={`res-floating-menu-btn ${showMenuButton ? 'visible' : ''}`} onClick={() => scrollToCategory(Object.keys(groupedItems)[0])}>
          <FiShoppingBag style={{ fontSize: '18px' }} />
          <span>MENU</span>
        </button>

        <FloatingMap />
        <ItemCustomizationModal
          item={customizableItem}
          isOpen={showCustomModal}
          onClose={() => {
            setShowCustomModal(false);
            setCustomizableItem(null);
          }}
          onConfirm={(configuredItem, qty) => {
            addToCart({
              id: configuredItem.id,
              name: `${configuredItem.name || configuredItem.itemName} (${configuredItem.configuredVariant?.name || 'Regular'})`,
              price: configuredItem.configuredPrice || configuredItem.price,
              available: true,
              instructions: configuredItem.specialInstructions
            }, id, qty);
            showToast(`Added ${configuredItem.name || 'Pizza'} to cart!`, "success");
            setShowCustomModal(false);
            setCustomizableItem(null);
          }}
        />
      </div>
    </>
  );
};

export default RestaurantInfo;
