import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Coupons.css";
import { FiTag, FiPlus, FiTrash2, FiClock, FiPercent, FiDollarSign } from "react-icons/fi";
import { useToast } from "../../context/ToastContext";
import { API_BASE_URL } from "../../api/api";

export default function Coupons() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderAmount: "",
    expiryDate: "",
    active: true
  });

  const fetchCoupons = () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/admin/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCoupons(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching coupons:", err);
        showToast("Failed to load coupons", "error");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAddCoupon = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    if (!newCoupon.code || !newCoupon.discountValue) {
        showToast("Please fill in required fields", "warning");
        return;
    }

    const payload = { 
        ...newCoupon, 
        expiryDate: newCoupon.expiryDate === "" ? null : newCoupon.expiryDate,
        minOrderAmount: newCoupon.minOrderAmount === "" ? null : parseFloat(newCoupon.minOrderAmount),
        discountValue: parseFloat(newCoupon.discountValue)
    };

    axios
      .post(`${API_BASE_URL}/admin/coupons`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCoupons([...coupons, res.data]);
        setShowAddForm(false);
        setNewCoupon({
          code: "",
          discountType: "PERCENTAGE",
          discountValue: "",
          minOrderAmount: "",
          expiryDate: "",
          active: true
        });
        showToast("Coupon created successfully", "success");
      })
      .catch((err) => {
        console.error("Error creating coupon:", err);
        showToast("Failed to create coupon", "error");
      });
  };

  return (
    <div className="container mt-5 coupons-page">
      <div className="premium-card">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="mb-1">Coupon Management</h2>
            <p className="text-muted small mb-0">Create and manage discount codes for users.</p>
          </div>
          <button 
            className="btn btn-primary rounded-pill px-4 fw-700"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "Cancel" : <><FiPlus /> Add New Coupon</>}
          </button>
        </div>

        {showAddForm && (
            <div className="add-coupon-form mb-5 reveal-item">
                <form onSubmit={handleAddCoupon} className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label small fw-bold">Coupon Code</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="e.g. WELCOME10"
                            value={newCoupon.code}
                            onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                            required
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold">Discount Type</label>
                        <select 
                            className="form-select"
                            value={newCoupon.discountType}
                            onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value})}
                        >
                            <option value="PERCENTAGE">Percentage (%)</option>
                            <option value="FIXED">Fixed Amount (₹)</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold">Value</label>
                        <input 
                            type="number" 
                            className="form-control" 
                            placeholder="Amount/Percent"
                            value={newCoupon.discountValue}
                            onChange={(e) => setNewCoupon({...newCoupon, discountValue: e.target.value})}
                            required
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold">Min Order Amount (₹)</label>
                        <input 
                            type="number" 
                            className="form-control" 
                            placeholder="Optional"
                            value={newCoupon.minOrderAmount}
                            onChange={(e) => setNewCoupon({...newCoupon, minOrderAmount: e.target.value})}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold">Expiry Date</label>
                        <input 
                            type="datetime-local" 
                            className="form-control" 
                            value={newCoupon.expiryDate}
                            onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                        />
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                        <button type="submit" className="btn btn-success w-100 rounded-pill fw-700 py-2">Create Coupon</button>
                    </div>
                </form>
            </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3"></div>
            <p className="text-muted fw-800">Fetching coupons...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Expires</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length > 0 ? coupons.map((coupon, index) => (
                  <tr key={coupon.id} className="reveal-item" style={{ animationDelay: `${index * 0.05}s` }}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-mini bg-light-soft text-primary"><FiTag /></div>
                        <div className="fw-800 text-dark">{coupon.code}</div>
                      </div>
                    </td>
                    <td>
                        <span className="badge bg-light text-dark border fw-600">
                            {coupon.discountType === "PERCENTAGE" ? <FiPercent className="me-1" /> : <FiDollarSign className="me-1" />}
                            {coupon.discountType}
                        </span>
                    </td>
                    <td>
                        <div className="fw-800 text-primary">
                            {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                        </div>
                    </td>
                    <td>
                        <div className="text-muted small fw-600">
                            {coupon.minOrderAmount ? `₹${coupon.minOrderAmount}+` : "No Min"}
                        </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 small fw-600 text-secondary">
                        <FiClock className="opacity-50" /> 
                        {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : "Never"}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${coupon.active ? 'active' : 'inactive'}`}>
                        {coupon.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="text-center py-5 text-muted">No coupons found. Start by adding one!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
