import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Reviews.css";
import { FiStar, FiTrash2, FiUser, FiCalendar, FiFilter, FiMessageSquare, FiHome, FiArrowRight } from "react-icons/fi";
import { IoStar, IoStarOutline } from "react-icons/io5";
import { useToast } from "../../context/ToastContext";
import { API_BASE_URL } from "../../api/api";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState(0); // 0 means all
  const { showToast } = useToast();

  const fetchReviews = () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setReviews(res.data || []);
        setFilteredReviews(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch reviews:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (filterRating === 0) {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter((r) => r.rating === filterRating));
    }
  }, [filterRating, reviews]);

  const deleteReview = (id) => {
    if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;

    const token = localStorage.getItem("token");
    axios
      .delete(`${API_BASE_URL}/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setReviews(reviews.filter((r) => r.id !== id));
        showToast("Review deleted successfully", "success");
      })
      .catch((err) => {
        showToast("Failed to delete review", "error");
        console.error(err);
      });
  };

  const renderStars = (count) => {
    return Array.from({ length: 5 }).map((_, i) => (
      i < count ? 
        <IoStar key={i} className="star-filled" /> : 
        <IoStarOutline key={i} className="star-empty" />
    ));
  };

  return (
    <div className="container mt-5 reviews-page">
      <div className="premium-card p-4 p-md-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4">
          <div>
            <h2 className="fw-800 mb-1">Feedback Moderation</h2>
            <p className="text-muted small fw-600 mb-0">Monitor and manage user ratings across the platform</p>
          </div>
          <div className="review-filters">
            <div className="filter-pill active border-0 bg-transparent pe-0">
               <FiFilter className="text-primary" />
            </div>
            <button
              className={`filter-pill ${filterRating === 0 ? "active" : ""}`}
              onClick={() => setFilterRating(0)}
            >
              All Feedback
            </button>
            {[5, 4, 3, 2, 1].map((num) => (
              <button
                key={num}
                className={`filter-pill ${filterRating === num ? "active" : ""}`}
                onClick={() => setFilterRating(num)}
              >
                {num} <IoStar className="ms-1 small" />
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-3 text-muted fw-800">Sourcing Feedback...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="empty-reviews-state">
            <FiMessageSquare className="mb-3 opacity-20" />
            <h5 className="fw-800 text-dark">No Feedback Found</h5>
            <p className="text-muted fw-600 mb-0">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="review-list">
            {filteredReviews.map((review, index) => (
              <div key={review.id} className="review-item reveal-item" style={{ animationDelay: `${index * 0.08}s` }}>
                <div className="user-avatar-circle me-4 d-none d-md-flex">
                  <FiUser />
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h6 className="fw-800 text-dark mb-0">{review.username}</h6>
                        <span className="badge bg-light text-muted border fw-700 rounded-pill px-2" style={{ fontSize: '0.65rem' }}>Verified User</span>
                      </div>
                      <div className="rating-stars-premium">
                        {renderStars(review.rating)}
                        <span className="review-meta-compact ms-3 d-flex align-items-center gap-1">
                          <FiCalendar className="small" /> {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn-delete-icon"
                      onClick={() => deleteReview(review.id)}
                      title="Delete Review"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  <div className="review-content-box p-3 bg-light rounded-4 border-light-subtle">
                    <p className="review-text-content mb-0">{review.comment || "No written comment provided."}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
