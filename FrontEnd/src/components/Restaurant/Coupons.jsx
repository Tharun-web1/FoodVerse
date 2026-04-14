import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Navbar from "../Restaurant/Navbar";
import { FiPlus, FiTrash2, FiTag, FiCalendar, FiDollarSign } from "react-icons/fi";
import { toast } from "react-toastify";
import "../RestaurantCss/Coupons.css";

export default function Coupons() {
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

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get("/restaurants/my-coupons");
      setCoupons(res.data);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setNewCoupon({ ...newCoupon, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
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

  const handleDelete = async (id) => {
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

  return (
    <div className="coupons-page">
      <Navbar />
      
      <div className="container mt-5 pt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="premium-title">
            <FiTag className="me-2" /> Manage Coupons
          </h2>
          <button 
            className={`btn ${showAddForm ? 'btn-outline-danger' : 'btn-primary-premium'}`}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "Cancel" : <><FiPlus className="me-1" /> Create New Coupon</>}
          </button>
        </div>

        {showAddForm && (
          <div className="card-premium mb-5 p-4 animate__animated animate__fadeInDown">
            <h4>Create a Discount Code</h4>
            <form onSubmit={handleSubmit} className="row g-3 mt-2">
              <div className="col-md-4">
                <label className="form-label">Coupon Code</label>
                <input 
                  type="text" 
                  className="form-control-premium" 
                  name="code" 
                  placeholder="e.g. SAVE20" 
                  required 
                  value={newCoupon.code}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Discount Type</label>
                <select 
                  className="form-control-premium" 
                  name="discountType"
                  value={newCoupon.discountType}
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                />
              </div>
              <div className="col-12 d-flex justify-content-end">
                <button type="submit" className="btn btn-primary-premium px-5">
                  Save Coupon
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
              <h3>No Active Coupons</h3>
              <p className="text-muted">Create your first discount code to attract more customers!</p>
            </div>
          ) : (
            coupons.map((coupon) => (
              <div key={coupon.id} className="col-md-6 col-lg-4">
                <div className="coupon-card animate__animated animate__zoomIn">
                  <div className="coupon-top">
                    <span className="coupon-code">{coupon.code}</span>
                    <button className="delete-btn" onClick={() => handleDelete(coupon.id)}>
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
    </div>
  );
}
