import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Navbar from "../Restaurant/Navbar";
import { FiPlus, FiTrash2, FiTag, FiCalendar, FiDollarSign, FiPercent, FiCheck, FiSearch, FiZap } from "react-icons/fi";
import { toast } from "react-toastify";
import "../RestaurantCss/Coupons.css";

export default function Coupons() {
  const [activeTab, setActiveTab] = useState("item-offers"); // "coupons" or "item-offers"
  
  // Coupon state
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderAmount: "",
    expiryDate: ""
  });

  // Item offer state
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [selectedPercentage, setSelectedPercentage] = useState(20);
  const [customPercentage, setCustomPercentage] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [offerExpiryDate, setOfferExpiryDate] = useState("");
  const [applyingOffer, setApplyingOffer] = useState(false);

  const presetPercentages = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];

  const setExpiryDurationDays = (days) => {
    if (!days) {
      setOfferExpiryDate("");
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + days);
    const isoString = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setOfferExpiryDate(isoString);
  };

  useEffect(() => {
    fetchCoupons();
    fetchMenuItems();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get("/restaurants/my-coupons");
      setCoupons(res.data || []);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await api.get('/restaurants/my-items');
      setMenuItems(res.data || []);
    } catch (err) {
      console.error("Error fetching menu items:", err);
    }
  };

  const handleCouponChange = (e) => {
    setNewCoupon({ ...newCoupon, [e.target.name]: e.target.value });
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/restaurants/add-coupon", newCoupon);
      toast.success("Coupon added successfully!");
      setShowAddForm(false);
      setNewCoupon({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        minOrderAmount: "",
        expiryDate: ""
      });
      fetchCoupons();
    } catch (err) {
      console.error("Error adding coupon:", err);
      toast.error(err.response?.data?.message || "Failed to add coupon");
    }
  };

  const handleCouponDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await api.delete(`/restaurants/coupons/${id}`);
        toast.success("Coupon deleted successfully");
        fetchCoupons();
      } catch (err) {
        console.error("Error deleting coupon:", err);
        toast.error("Failed to delete coupon");
      }
    }
  };

  // Item offer logic
  const handleItemSelect = (id) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItemIds(filteredItems.map(item => item.id));
    } else {
      setSelectedItemIds([]);
    }
  };

  // Unique categories
  const categories = ["All", ...Array.from(new Set(menuItems.map(i => i.category).filter(Boolean)))];

  const handleSelectCategoryItems = (catName) => {
    const catItems = menuItems.filter(i => catName === "All" || i.category === catName);
    const catIds = catItems.map(i => i.id);
    const allSelected = catIds.every(id => selectedItemIds.includes(id));
    
    if (allSelected) {
      setSelectedItemIds(prev => prev.filter(id => !catIds.includes(id)));
    } else {
      setSelectedItemIds(prev => Array.from(new Set([...prev, ...catIds])));
    }
  };

  const currentDiscount = customPercentage ? parseFloat(customPercentage) : selectedPercentage;

  const handleApplyOffer = async () => {
    if (selectedItemIds.length === 0) {
      toast.warning("Please select at least one menu item!");
      return;
    }
    if (!currentDiscount || currentDiscount < 5 || currentDiscount > 100) {
      toast.error("Discount percentage must be between 5% and 100%");
      return;
    }

    setApplyingOffer(true);
    try {
      await api.post("/restaurants/apply-item-offer", {
        itemIds: selectedItemIds,
        discountPercentage: currentDiscount,
        offerTitle: currentDiscount === 100 ? "100% OFF (FREE)" : `${Math.round(currentDiscount)}% OFF`,
        offerExpiryDate: offerExpiryDate || null
      });
      toast.success(`Applied ${currentDiscount}% OFF to ${selectedItemIds.length} item(s)!`);
      setSelectedItemIds([]);
      fetchMenuItems();
    } catch (err) {
      console.error("Error applying offer:", err);
      toast.error(err.response?.data?.message || "Failed to apply offer");
    } finally {
      setApplyingOffer(false);
    }
  };

  const handleRemoveOffer = async (itemId) => {
    try {
      await api.post("/restaurants/remove-item-offer", {
        itemIds: [itemId]
      });
      toast.success("Offer removed successfully");
      fetchMenuItems();
    } catch (err) {
      console.error("Error removing offer:", err);
      toast.error("Failed to remove offer");
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.itemName?.toLowerCase().includes(itemSearch.toLowerCase()) ||
                          item.category?.toLowerCase().includes(itemSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const offeredItems = menuItems.filter(item => item.offerActive && item.discountPercentage > 0);

  return (
    <div className="coupons-page">
      <Navbar />
      
      <div className="container mt-5 pt-4">
        {/* Page Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h2 className="premium-title mb-1">
              <FiZap className="me-2 text-warning" /> Coupons & Special Offers
            </h2>
            <p className="text-muted small mb-0">Create promo codes or activate percentage discounts (5% - 100% OFF) for menu items</p>
          </div>

          {activeTab === "coupons" && (
            <button 
              className={`btn ${showAddForm ? 'btn-outline-danger' : 'btn-primary-premium'}`}
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? "Cancel" : <><FiPlus className="me-1" /> Create Promo Code</>}
            </button>
          )}
        </div>

        {/* Section Tabs */}
        <div className="offers-tab-navigation mb-4">
          <button 
            className={`tab-nav-btn ${activeTab === "item-offers" ? "active" : ""}`}
            onClick={() => setActiveTab("item-offers")}
          >
            <FiPercent className="me-2" /> Item Discounts (5% - 100% OFF)
            {offeredItems.length > 0 && <span className="tab-badge ms-2">{offeredItems.length} Active</span>}
          </button>
          <button 
            className={`tab-nav-btn ${activeTab === "coupons" ? "active" : ""}`}
            onClick={() => setActiveTab("coupons")}
          >
            <FiTag className="me-2" /> Promo Coupon Codes
            {coupons.length > 0 && <span className="tab-badge ms-2">{coupons.length}</span>}
          </button>
        </div>

        {/* TAB 1: ITEM PERCENTAGE OFFERS (5% - 100% OFF) */}
        {activeTab === "item-offers" && (
          <div className="item-offers-section">
            {/* Step 1: Select Percentage */}
            <div className="card-premium p-4 mb-4">
              <h4 className="section-subtitle">
                <span className="step-number me-2">1</span> Select Percentage Offer (5% - 100% OFF)
              </h4>
              <p className="text-muted small">Choose a preset percentage or type a custom discount amount</p>

              <div className="percentage-pill-grid mb-3">
                {presetPercentages.map(pct => (
                  <button
                    key={pct}
                    type="button"
                    className={`percentage-pill ${selectedPercentage === pct && !customPercentage ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedPercentage(pct);
                      setCustomPercentage("");
                    }}
                  >
                    {pct === 100 ? "100% (FREE)" : `${pct}% OFF`}
                  </button>
                ))}
              </div>

              <div className="row align-items-center g-3 mb-3">
                <div className="col-auto">
                  <label className="form-label mb-0 fw-semibold">Custom Percentage:</label>
                </div>
                <div className="col-auto">
                  <div className="input-group" style={{ maxWidth: '160px' }}>
                    <input 
                      type="number"
                      min="5"
                      max="100"
                      className="form-control form-control-premium"
                      placeholder="e.g. 35"
                      value={customPercentage}
                      onChange={(e) => setCustomPercentage(e.target.value)}
                    />
                    <span className="input-group-text">% OFF</span>
                  </div>
                </div>
                <div className="col-auto">
                  <span className="badge bg-danger-subtle text-danger p-2 rounded-3">
                    Active Discount: <strong>{currentDiscount || 0}% OFF</strong>
                  </span>
                </div>
              </div>

              {/* Offer Expiry Selector */}
              <div className="pt-3 border-top">
                <label className="form-label fw-semibold mb-2">
                  <FiCalendar className="me-1 text-danger" /> Offer Expiry Date & Time (Optional):
                </label>
                <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                  <button type="button" className={`btn btn-sm ${!offerExpiryDate ? 'btn-dark' : 'btn-outline-secondary'}`} onClick={() => setExpiryDurationDays(0)}>
                    No Expiry (Permanent)
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setExpiryDurationDays(1)}>
                    1 Day
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setExpiryDurationDays(3)}>
                    3 Days
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setExpiryDurationDays(7)}>
                    7 Days
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setExpiryDurationDays(30)}>
                    30 Days
                  </button>
                </div>
                <div style={{ maxWidth: '280px' }}>
                  <input
                    type="datetime-local"
                    className="form-control form-control-premium"
                    value={offerExpiryDate}
                    onChange={(e) => setOfferExpiryDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Select Items & Apply */}
            <div className="card-premium p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h4 className="section-subtitle mb-0">
                  <span className="step-number me-2">2</span> Select Menu Items to Apply Offer
                </h4>

                <div className="search-box-wrapper" style={{ maxWidth: '280px' }}>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <FiSearch className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Search items..."
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Categories Filter Bar */}
              <div className="category-filter-bar mb-3">
                <label className="form-label text-muted small fw-bold mb-2 d-block">Filter & Select by Category:</label>
                <div className="category-pill-wrapper">
                  {categories.map(cat => {
                    const count = cat === "All" ? menuItems.length : menuItems.filter(i => i.category === cat).length;
                    const catItems = menuItems.filter(i => cat === "All" || i.category === cat);
                    const allCatSelected = catItems.length > 0 && catItems.every(i => selectedItemIds.includes(i.id));

                    return (
                      <div key={cat} className="d-inline-flex align-items-center me-2 mb-2">
                        <button
                          type="button"
                          className={`category-filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                          onClick={() => setSelectedCategory(cat)}
                        >
                          {cat} <span className="cat-count-badge">({count})</span>
                        </button>
                        {cat !== "All" && (
                          <button
                            type="button"
                            className={`btn btn-sm cat-select-btn ms-1 ${allCatSelected ? 'btn-success' : 'btn-outline-secondary'}`}
                            onClick={() => handleSelectCategoryItems(cat)}
                            title={allCatSelected ? `Deselect all ${cat} items` : `Select all ${cat} items`}
                          >
                            {allCatSelected ? "✓ All" : "+ Select"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="selectAllItems"
                    checked={filteredItems.length > 0 && filteredItems.every(i => selectedItemIds.includes(i.id))}
                    onChange={handleSelectAll}
                  />
                  <label className="form-check-label fw-bold cursor-pointer" htmlFor="selectAllItems">
                    Select All Shown ({filteredItems.length} items)
                  </label>
                </div>
                <span className="text-muted small">
                  Total Selected: <strong>{selectedItemIds.length}</strong> item(s)
                </span>
              </div>

              {/* Items Checkbox Grid */}
              <div className="item-selection-grid mb-4">
                {filteredItems.length === 0 ? (
                  <p className="text-center text-muted py-3">No menu items found</p>
                ) : (
                  filteredItems.map(item => {
                    const isSelected = selectedItemIds.includes(item.id);
                    const discountedPrice = Math.round(item.price * (1 - currentDiscount / 100));

                    return (
                      <div 
                        key={item.id} 
                        className={`item-select-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleItemSelect(item.id)}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <input
                            type="checkbox"
                            className="form-check-input flex-shrink-0"
                            checked={isSelected}
                            onChange={() => {}} // handled by card click
                          />
                          <div className="flex-grow-1 min-w-0">
                            <h6 className="item-name mb-0 text-truncate">{item.itemName}</h6>
                            <span className="item-category text-muted small">{item.category}</span>
                          </div>
                          <div className="text-end flex-shrink-0">
                            <span className="original-price text-muted text-decoration-line-through me-2 small">
                              ₹{item.price}
                            </span>
                            <span className="discount-price fw-bold text-success">
                              ₹{discountedPrice}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-primary-premium btn-lg px-4"
                  disabled={applyingOffer || selectedItemIds.length === 0}
                  onClick={handleApplyOffer}
                >
                  {applyingOffer ? "Applying..." : <><FiCheck className="me-2" /> Apply {currentDiscount}% OFF to {selectedItemIds.length} Item(s)</>}
                </button>
              </div>
            </div>

            {/* Currently Active Offers */}
            <div className="card-premium p-4">
              <h4 className="section-subtitle mb-3">
                <FiZap className="me-2 text-warning" /> Currently Active Item Offers ({offeredItems.length})
              </h4>

              {offeredItems.length === 0 ? (
                <div className="text-center py-4 no-data-box">
                  <FiPercent size={40} className="text-muted mb-2" />
                  <p className="text-muted mb-0">No item discounts currently active. Apply an offer above!</p>
                </div>
              ) : (
                <div className="row g-3">
                  {offeredItems.map(item => {
                    const discountedPrice = Math.round(item.price * (1 - item.discountPercentage / 100));
                    return (
                      <div key={item.id} className="col-md-6 col-lg-4">
                        <div className="active-offer-card p-3 rounded-3 border">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <span className="badge bg-danger mb-2">🔥 {item.discountPercentage}% OFF</span>
                              <h6 className="fw-bold mb-1">{item.itemName}</h6>
                              <span className="text-muted small">{item.category}</span>
                            </div>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveOffer(item.id)}
                              title="Remove Offer"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                            <span className="text-muted small">Special Price:</span>
                            <div>
                              <span className="text-muted text-decoration-line-through me-2 small">₹{item.price}</span>
                              <span className="fw-bold text-success fs-5">₹{discountedPrice}</span>
                            </div>
                          </div>

                          {item.offerExpiryDate ? (
                            <div className="mt-2 pt-2 border-top text-muted small d-flex align-items-center justify-content-between">
                              <span><FiCalendar className="me-1 text-danger" /> Expires:</span>
                              <span className="fw-semibold text-dark">
                                {new Date(item.offerExpiryDate).toLocaleDateString()} {new Date(item.offerExpiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ) : (
                            <div className="mt-2 pt-2 border-top text-muted small d-flex align-items-center justify-content-between">
                              <span><FiCalendar className="me-1 text-muted" /> Expiry:</span>
                              <span className="badge bg-secondary-subtle text-secondary">No Expiry (Permanent)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PROMO CODE COUPONS */}
        {activeTab === "coupons" && (
          <div className="promo-coupons-section">
            {showAddForm && (
              <div className="card-premium mb-5 p-4 animate__animated animate__fadeInDown">
                <h4>Create a Promo Code Coupon</h4>
                <form onSubmit={handleCouponSubmit} className="row g-3 mt-2">
                  <div className="col-md-4">
                    <label className="form-label">Coupon Code</label>
                    <input 
                      type="text" 
                      className="form-control-premium" 
                      name="code" 
                      placeholder="e.g. SAVE20" 
                      required 
                      value={newCoupon.code}
                      onChange={handleCouponChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Discount Type</label>
                    <select 
                      className="form-control-premium" 
                      name="discountType"
                      value={newCoupon.discountType}
                      onChange={handleCouponChange}
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Discount Value</label>
                    <input 
                      type="number" 
                      className="form-control-premium" 
                      name="discountValue" 
                      placeholder="Amount/Percent" 
                      required 
                      value={newCoupon.discountValue}
                      onChange={handleCouponChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Min Order Amount (₹)</label>
                    <input 
                      type="number" 
                      className="form-control-premium" 
                      name="minOrderAmount" 
                      placeholder="e.g. 200" 
                      value={newCoupon.minOrderAmount}
                      onChange={handleCouponChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Expiry Date & Time</label>
                    <input 
                      type="datetime-local" 
                      className="form-control-premium" 
                      name="expiryDate" 
                      required 
                      value={newCoupon.expiryDate}
                      onChange={handleCouponChange}
                    />
                  </div>
                  <div className="col-12 d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary-premium px-5">
                      Save Coupon Code
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="row g-4">
              {loading ? (
                <div className="col-12 text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2">Loading your coupons...</p>
                </div>
              ) : coupons.length === 0 ? (
                <div className="col-12 text-center py-5 no-data-box">
                  <FiTag size={50} className="text-muted mb-3" />
                  <h3>No Active Promo Codes</h3>
                  <p className="text-muted">Create your first coupon code to attract more customers!</p>
                </div>
              ) : (
                coupons.map((coupon) => (
                  <div key={coupon.id} className="col-md-6 col-lg-4">
                    <div className="coupon-card animate__animated animate__zoomIn">
                      <div className="coupon-top">
                        <span className="coupon-code">{coupon.code}</span>
                        <button className="delete-btn" onClick={() => handleCouponDelete(coupon.id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                      <div className="coupon-body">
                        <div className="coupon-benefit">
                          {coupon.discountType === "PERCENTAGE" ? (
                            <><FiTag className="me-2" /> {coupon.discountValue}% OFF</>
                          ) : (
                            <><FiDollarSign  className="me-2" /> ₹{coupon.discountValue} OFF</>
                          )}
                        </div>
                        <div className="coupon-detail">
                          <small>Min Order: ₹{coupon.minOrderAmount || 0}</small>
                        </div>
                        <div className="coupon-expiry">
                          <FiCalendar className="me-1" />
                          Expires: {new Date(coupon.expiryDate).toLocaleDateString()} {new Date(coupon.expiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
