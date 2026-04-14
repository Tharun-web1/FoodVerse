import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "../RestaurantCss/Navbar.css";
import Profile from "./Profile";
import { FiGrid, FiLayers, FiClipboard, FiUser, FiLogOut, FiMenu, FiTag } from "react-icons/fi";
import { IoRestaurantOutline } from "react-icons/io5";
import logo from "../../assets/images/logo2.jpeg";
export default function Navbar() {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const navbarCollapseRef = React.useRef(null);
  const navbarTogglerRef = React.useRef(null);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("restaurant_token");
      localStorage.removeItem("restaurantId");
      navigate("/login/res");
    }
  };

  React.useEffect(() => {
    const handleScrollOrClick = (e) => {
      if (navbarCollapseRef.current && navbarCollapseRef.current.classList.contains('show')) {
        if (navbarTogglerRef.current && navbarTogglerRef.current.contains(e.target)) return;
        if (navbarTogglerRef.current) navbarTogglerRef.current.click();
      }
    };

    window.addEventListener('scroll', handleScrollOrClick);
    document.addEventListener('click', handleScrollOrClick);
    return () => {
      window.removeEventListener('scroll', handleScrollOrClick);
      document.removeEventListener('click', handleScrollOrClick);
    };
  }, []);

  return (
    <>
      <nav id="res-navbar-premium" className={`navbar navbar-expand-lg navbar-dark r-navbar fixed-top ${showProfile ? 'navbar-shifted' : ''}`}>
        <div className="container-fluid px-5">
          <Link className="navbar-brand-premium" to="/res/dash">
            <div className="brand-logo-container">
              <img src={logo} alt="Restaurant Logo" className="brand-logo-image" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <span className="brand-name-text">BITEZY</span>
          </Link>

          <button
            ref={navbarTogglerRef}
            className="navbar-toggler-custom"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbar"
          >
            <FiMenu size={24} color="white" />
          </button>

          <div className="collapse navbar-collapse" id="navbar" ref={navbarCollapseRef}>
            <ul className="navbar-nav ms-auto align-items-lg-center gap-2">
              <li className="nav-item">
                <NavLink className="nav-link-premium" to="/res/dash">
                  <FiGrid size={18} /> <span>Dashboard</span>
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link-premium" to="/res/menu">
                  <FiLayers size={18} /> <span>Menu Items</span>
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link-premium" to="/res/orders">
                  <FiClipboard size={18} /> <span>Orders</span>
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link-premium" to="/res/coupons">
                  <FiTag size={18} /> <span>Coupons</span>
                </NavLink>
              </li>

              <li className="nav-item">
                <button
                  className="nav-link-premium profile-btn-nav"
                  onClick={() => setShowProfile(true)}
                >
                  <FiUser size={18} /> <span>Profile</span>
                </button>
              </li>

              <li className="nav-item ms-lg-4">
                <button className="btn logout-btn-premium" onClick={handleLogout}>
                  <FiLogOut size={18} /> <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Profile Overlay */}
      <Profile open={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
}
