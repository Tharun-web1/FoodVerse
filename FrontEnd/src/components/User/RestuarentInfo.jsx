import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../User/Navbar";
import "../UserCss/RestuarentInfo.css";
import { FiStar, FiClock, FiSearch, FiShoppingBag } from "react-icons/fi";
import { useCart } from "./CartContext";
import { API_BASE_URL } from "../../api/api";
import FloatingMap from "./FloatingMap";
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
  const { cartItems, addToCart, removeFromCart } = useCart();
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

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const getItemQty = (itemId) => {
    const item = cartItems.find(ci => ci.itemId === itemId);
    return item ? item.qty : 0;
  };

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchInitialData = async () => {
      try {
        const resRes = await axios.get(`${API_BASE_URL}/restaurants/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRestaurant(resRes.data);
        setLoading(false);

        const itemsRes = await axios.get(`${API_BASE_URL}/restaurants/${id}/items`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(itemsRes.data);

        const revRes = await axios.get(`${API_BASE_URL}/reviews/restaurant/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviews(revRes.data);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchInitialData();

    const handleScroll = () => {
      const scrollPos = window.scrollY;
      setShowStickyBar(scrollPos > 400); // Show bar after header scrolls out
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [id]);

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

  const groupedItems = sortedItems.reduce((acc, item) => {
    const category = item.category || "Others";
    acc[category] = acc[category] || [];
    acc[category].push(item);
    return acc;
  }, {});

  const highlightText = (text) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
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

  return (
    <>
      <Navbar />
      <div className="restaurant-page">
        {/* TOP BREADCRUMB / BACK */}
        {/* <div className="breadcrumb">
          {t("home")} / {restaurant.location} / <span className="current">{restaurant.name}</span>
        </div> */}

        {/* RESTAURANT HEADER SECTION */}
        <div className="res-detailed-header">
          <div className="res-header-left">
            <h1 style={{ "fontFamily": "'outfit', sans-serif" }}>{restaurant.name}</h1>
            <p className="res-cuisines">{restaurant.discription}</p>
            <p className="res-location">{restaurant.location}</p>
            <div className="res-meta-info">
              <div className="res-rating-info">
                <FiStar className="star-icon" />
                <span>{restaurant.rating > 0 ? restaurant.rating.toFixed(1) : t("new")} ({restaurant.review || 0} {t("ratings")})</span>
              </div>
              <div className="dot-separator"></div>
              <div className="res-time-info">
                <FiClock className="clock-icon" />
                <span>25-30 {t("mins")}</span>
              </div>
            </div>
          </div>
          <div className="res-header-right">
            <img
              src={`${API_BASE_URL}/restaurants/${id}/image`}
              alt={restaurant.name}
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop"; }}
            />
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="res-tabs-nav">
          <button className={activeTab === 'menu' ? 'active' : ''} onClick={() => setActiveTab('menu')}>{t("menu")}</button>
          <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>{t("reviews")} ({reviews.length})</button>
        </div>

        {activeTab === 'menu' ? (
          <>
            {/* MENU CONTROLS - MINIMAL */}
            <div className="menu-controls">
              <div className="menu-search-bar">
                <FiSearch className="menu-search-icon" />
                <input
                  type="text"
                  placeholder={`${t("search_in")} ${restaurant.name}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="menu-filters">
                <button className={foodFilter === "veg" ? "active veg" : "veg"} onClick={() => setFoodFilter(foodFilter === "veg" ? "all" : "veg")}>{t("veg_only")}</button>
                <button className={foodFilter === "non-veg" ? "active nonveg" : "nonveg"} onClick={() => setFoodFilter(foodFilter === "non-veg" ? "all" : "non-veg")}>{t("non_veg")}</button>
                <div className="menu-sort-dropdown">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="">{t("sort_by")}</option>
                    <option value="priceLow">{t("price_low_high")}</option>
                    <option value="priceHigh">{t("price_high_low")}</option>
                    <option value="rating">{t("rating_high_low")}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* STICKY CATEGORY BAR */}
            <div className={`sticky-category-bar ${showStickyBar ? 'visible' : ''}`}>
              <div className="category-scroll-wrapper">
                {Object.keys(groupedItems).map((category) => (
                  <button
                    key={category}
                    className="sticky-cat-item"
                    onClick={() => scrollToCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* MENU LIST */}
            <div className="menu-main-content">
              {Object.keys(groupedItems).map((category) => (
                <div key={category} id={`category-${category}`} className="menu-category-section">
                  <h2 className="menu-category-header">{category} ({groupedItems[category].length})</h2>
                  <div className="menu-items-grid">
                    {groupedItems[category].map((item) => (
                      <div className={`menu-item-card ${!item.available ? 'item-unavailable' : ''}`} key={item.id}>
                        <div className="menu-item-details">
                          <div className={`food-mark ${item.type?.toLowerCase() === "veg" ? "veg" : "nonveg"}`}>
                            <div className="food-mark-dot"></div>
                          </div>
                          <h3 dangerouslySetInnerHTML={{ __html: highlightText(item.itemName) }}></h3>
                          <p className="menu-item-price">₹{item.price}</p>
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
                              <button className="add-to-cart-btn" onClick={() => { if (navigator.vibrate) navigator.vibrate(15); addToCart(item, id); }}>{t("add")}</button>
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
          </>
        ) : (
          <div className="reviews-section-container">
            <div className="reviews-header-actions">
              <h2>{t("customer_reviews")}</h2>
              <button className="write-review-btn" onClick={() => setShowReviewModal(true)}>
                {t("write_review")}
              </button>
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

        {/* FLOATING CART SUMMARY (Mobile/Sticky) */}
        {cartItems.length > 0 && (
          <div className="floating-cart-summary">
            <div className="cart-bar-info">
              <span>{cartItems.length} {t("items")}</span>
              <span className="cart-total-amount">₹{total}</span>
            </div>
            <button className="view-cart-action-btn" onClick={() => navigate("/cart")}>
              <FiShoppingBag style={{ marginRight: '8px' }} />
              {t("view_cart")}
            </button>
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
        <FloatingMap />
      </div>
    </>
  );
};

export default RestaurantInfo;
