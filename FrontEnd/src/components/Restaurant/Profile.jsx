import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import "../RestaurantCss/Profile.css";
import "../RestaurantCss/Profile.css";

export default function Profile({ open = true, onClose }) {
  const navigate = useNavigate();

  const token = localStorage.getItem("restaurant_token");
  // Use restaurantId for fetching images instead of individual file IDs
  const restaurantId = localStorage.getItem("restaurantId");

  const [restaurantName, setRestaurantName] = useState("Restaurant");
  const [logoUrl, setLogoUrl] = useState(null);
  const [coverUrl, setCoverUrl] = useState(null);
  const [currentId, setCurrentId] = useState(restaurantId);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open === false) return;

    let currentLogoUrl = null;
    let currentCoverUrl = null;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        let currentRestaurantId = restaurantId;

        // Fetch Restaurant Details (Name + ID)
        try {
          const profileRes = await api.get('/restaurants/profile');

          setRestaurantName(profileRes.data.username || "Restaurant");
          if (profileRes.data.id) {
            currentRestaurantId = profileRes.data.id;
            setCurrentId(currentRestaurantId);
            localStorage.setItem("restaurantId", currentRestaurantId);
          }
        } catch (err) {
          console.error("Failed to load profile info", err);
          // Fallback to name-only endpoint
          try {
            const nameRes = await api.get('/restaurant/test');
            setRestaurantName(nameRes.data);
          } catch (e) { }
        }

        if (currentRestaurantId) {
          // Fetch Cover Image
          try {
            const coverRes = await api.get(`/restaurants/${currentRestaurantId}/image`, {
              responseType: "blob"
            });

            const coverBlob = coverRes.data;
            currentCoverUrl = URL.createObjectURL(coverBlob);
            setCoverUrl(currentCoverUrl);
          } catch (err) {
            console.error("Failed to load cover image", err);
          }

          // Fetch Logo Image
          try {
            const logoRes = await api.get(`/restaurants/logoimage/${currentRestaurantId}`, {
              responseType: "blob"
            });

            const logoBlob = logoRes.data;
            currentLogoUrl = URL.createObjectURL(logoBlob);
            setLogoUrl(currentLogoUrl);
          } catch (err) {
            console.error("Failed to load logo", err);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      if (currentLogoUrl) URL.revokeObjectURL(currentLogoUrl);
      if (currentCoverUrl) URL.revokeObjectURL(currentCoverUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, token, restaurantId]);

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("restaurant_token");
      localStorage.removeItem("restaurantId");
      localStorage.removeItem("username");
      navigate("/login/res");
    }
  };

  const showClass = open ? "show" : "";
  const openClass = open ? "open" : "";

  return (
    <>
      {/* Overlay */}
      <div
        className={`sidebar-overlay ${showClass}`}
        onClick={onClose} // Keep click-outside to close
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div className={`profile-sidebar ${openClass}`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '15px',
            zIndex: 10,
            background: 'rgba(0,0,0,0.4)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}
          title="Close Profile"
        >
          &times;
        </button>

        {/* COVER */}
        <div className={`sidebar-cover ${isLoading && !coverUrl ? "loading-skeleton" : ""}`}>
          {coverUrl ? (
            <img src={coverUrl} alt="Cover" />
          ) : (
            !isLoading && <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' }}></div>
          )}
        </div>

        {/* PROFILE */}
        <div className="sidebar-profile">
          <div className={`sidebar-logo-container ${isLoading && !logoUrl ? "loading-skeleton" : ""}`}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="sidebar-logo" />
            ) : (
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50' y='50' font-family='Arial, sans-serif' font-size='14' fill='%23888' text-anchor='middle' dy='.3em'%3ELogo%3C/text%3E%3C/svg%3E" alt="Placeholder" className="sidebar-logo" style={{ opacity: isLoading ? 0.3 : 1 }} />
            )}
          </div>
          <h3>Hello, {isLoading ? "Loading..." : restaurantName}</h3>
        </div>

        {/* MENU */}
        <ul className="sidebar-menu">
          <li onClick={() => navigate("/res/dash")}>Dashboard</li>
          <li onClick={() => navigate("/res/menu")}>Menu Items</li>
          <li onClick={() => navigate("/res/order-history")}>Order History</li>
          <li onClick={() => navigate(`/res/details/edit/${currentId}`)}>Edit Restaurant</li>
          <li className="logout" onClick={logout}>Logout</li>
        </ul>
      </div>
    </>
  );
}
