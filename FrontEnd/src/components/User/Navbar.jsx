import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiUser, FiLogIn, FiShoppingBag, FiList, FiLogOut, FiSearch, FiGlobe, FiCreditCard } from "react-icons/fi";
import axios from "axios";
import { API_BASE_URL } from "../../api/api";
import logo from "../../assets/images/logo2.jpeg";
import ProfileSidebar from "../User/ProfileSidebar";
import LanguagePicker from "../User/LanguagePicker";
import LocationSelector from "../User/LocationSelector";
import BottomNav from "../User/BottomNav";
import { useCart } from "../User/CartContext";
import { useTranslation } from "react-i18next";

import "../UserCss/Navbar.css";

const Navbar = ({ onSearch, onOpenSearch }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLangPickerOpen, setIsLangPickerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [navbarUserLocation, setNavbarUserLocation] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);

  const { cartItems } = useCart();
  const cartItemCount = cartItems.reduce((total, item) => total + item.qty, 0);

  const handleLocationChange = (location) => {
    setNavbarUserLocation(location.displayName);
  };

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (isLoggedIn) {
      const fetchWallet = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          setWalletBalance(res.data.walletBalance || 0);
        } catch (err) {
          console.error("Error fetching wallet in navbar", err);
        }
      };
      fetchWallet();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchValue);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, onSearch]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    setProfileOpen(false);
    setMenuOpen(false);

    navigate("/", { replace: true });
  };

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const isActive = (path) => location.pathname === path ? 'active-link1' : '';
  const isHome = location.pathname === '/' || location.pathname === '/user' || location.pathname === '/user-home' || location.pathname === '/user/';

  return (
    <>
      <nav className={`navbar1 fixed-top ${menuOpen ? 'menu-open1' : ''} ${profileOpen ? 'shifted1' : ''} ${!isHome ? 'mobile-hidden1' : ''}`}>
        <div className="navbar-container1 ">
          <div className="navbar-location1">
            <LocationSelector onLocationChange={handleLocationChange} autoDetectOnMobile={true} />
          </div>

          {isLoggedIn && (
            <button
              className="nav-wallet-btn-mobile1"
              onClick={() => navigate("/profile")}
              aria-label="View Wallet"
            >
              <FiCreditCard className="wallet-mini-icon1" />
              <span className="wallet-balance-text1">₹{walletBalance.toFixed(2)}</span>
            </button>
          )}

          <div
            className="navbar-brand1"
            onClick={() => {
              closeMenu();
              navigate("/user");
            }}
          >
            <img src={logo} alt="Bitezy Logo" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ color: 'white' }} className="brand-name1">BITEZY</span>
          </div>

          {/* Desktop Search Bar */}
          <div className="navbar-search1" onClick={onOpenSearch}>
            <FiSearch className="nav-search-icon1" />
            <input
              type="text"
              placeholder={t("search_placeholder")}
              value={searchValue}
              readOnly
              className="nav-search-input-fake1"
            />
          </div>

          {/* Mobile Language Switcher */}
          {/* <button
            className="nav-lang-btn-mobile1"
            onClick={() => setIsLangPickerOpen(true)}
            aria-label="Change Language"
          >
            <FiGlobe />
          </button> */}

          {/* Mobile Toggler - Hidden in desktop or on BottomNav pages but kept for structure */}
          <button
            className={`navbar-toggler1 ${menuOpen ? 'active1' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation"
          >
            <span className="bar1"></span>
            <span className="bar1"></span>
            <span className="bar1"></span>
          </button>

          <ul className={`navbar-menu1 ${menuOpen ? "active1" : ""}`}>
            <li className="nav-item1">
              <button
                className={`nav-link1 ${isActive('/')}`}
                onClick={() => {
                  closeMenu();
                  navigate("/user");
                }}
              >
                <FiHome /> {t("home")}
              </button>
            </li>

            {isLoggedIn ? (
              <>
                <li className="nav-item1">
                  <button
                    className={`nav-link1 ${isActive('/cart')}`}
                    onClick={() => {
                      closeMenu();
                      navigate("/cart");
                    }}
                  >
                    <div className="cart-icon-wrapper1">
                      <FiShoppingBag />
                      {cartItemCount > 0 && (
                        <span className="cart-badge1">{cartItemCount}</span>
                      )}
                    </div>
                    <span className="cart-text1">{t("cart")}</span>
                  </button>
                </li>
                <li className="nav-item1">
                  <button
                    className={`nav-link1 ${isActive('/orders')}`}
                    onClick={() => {
                      closeMenu();
                      navigate("/orders");
                    }}
                  >
                    <FiList /> {t("orders")}
                  </button>
                </li>

                <li className="nav-item1">
                  <button
                    className={`nav-link1 ${isActive('/profile')}`}
                    onClick={() => {
                      closeMenu();
                      setProfileOpen(true);
                    }}
                  >
                    <FiUser /> {t("profile")}
                  </button>
                </li>

                <li className="nav-item1">
                  <button className="logout-btn1" onClick={handleLogout}>
                    <FiLogOut /> {t("logout")}
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item1">
                  <button
                    className="nav-link1"
                    onClick={() => {
                      closeMenu();
                      navigate("/login/user");
                    }}
                  >
                    <FiLogIn /> {t("login")}
                  </button>
                </li>

                <li className="nav-item1">
                  <button
                    className="nav-link1"
                    onClick={() => {
                      closeMenu();
                      navigate("/signup/user");
                    }}
                  >
                    <FiUser /> {t("signup")}
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>


      {/* PROFILE SIDEBAR */}
      <ProfileSidebar
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />

      <LanguagePicker
        isOpen={isLangPickerOpen}
        onClose={() => setIsLangPickerOpen(false)}
      />

      {/* MOBILE BOTTOM NAVIGATION */}
      <BottomNav
        onProfileToggle={() => setProfileOpen(prev => !prev)}
        onSearchToggle={onOpenSearch}
      />

      {menuOpen && <div className="nav-menu-overlay1" onClick={closeMenu}></div>}
    </>
  );
};

export default Navbar;
