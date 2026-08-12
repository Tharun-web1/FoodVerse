import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from 'react-i18next';
import "../UserCss/ProfileSidebar.css";
import { API_BASE_URL } from "../../api/api";
import InfoModal from "./InfoModal";
import {
  FiCamera, FiTrash2, FiX, FiUser, FiSettings, FiTag, FiTruck,
  FiShoppingBag, FiMessageSquare, FiHelpCircle, FiInfo, FiFileText,
  FiShield, FiRotateCcw, FiSlash, FiGlobe, FiArrowLeft, FiMoreVertical,
  FiChevronRight, FiCreditCard, FiMapPin, FiSmartphone, FiClipboard, FiHeart,
  FiEyeOff, FiGift
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import namecardBg from "../../assets/images/bitezy-namecard.png";
import Settings from "./Settings";

const ProfileSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dotsMenuRef = useRef(null);
  const { t, i18n } = useTranslation();
  const { user, token, logout } = useAuth();

  const [imageUrl, setImageUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeInfo, setActiveInfo] = useState({ isOpen: false, title: '', content: '' });

  // Custom High-Fidelity States
  const [showDotsMenu, setShowDotsMenu] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "User",
    mail: "",
    phnno: "",
    walletBalance: 0
  });

  const [userSavings, setUserSavings] = useState(0);

  const fetchUserSavings = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data)) {
        const computed = res.data.reduce((sum, order) => {
          const status = (order.status || '').toLowerCase();
          if (['cancelled', 'rejected', 'failed'].includes(status)) return sum;
          const couponSavings = Number(order.discountAmount || order.discount || order.couponDiscount || 0);
          const deliverySavings = (order.deliveryFee === 0 || order.delivery_fee === 0 || order.freeDelivery) ? 35 : 0;
          return sum + couponSavings + deliverySavings;
        }, 0);
        setUserSavings(computed);
        localStorage.setItem('bitezyOneSavings', computed.toString());
      }
    } catch (err) {
      console.error("Error fetching user savings from database orders:", err);
    }
  };

  const fetchProfileImage = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/users/me/profile-image`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      if (imageUrl) URL.revokeObjectURL(imageUrl);
      const blobUrl = URL.createObjectURL(res.data);
      setImageUrl(blobUrl);
    } catch {
      setImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileData = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData({
        username: res.data.username || "User",
        mail: res.data.mail || "",
        phnno: res.data.phnno || "",
        walletBalance: res.data.walletBalance || 0
      });
    } catch (err) {
      console.error("Error fetching user details in sidebar", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfileImage();
      fetchProfileData();
      fetchUserSavings();
    }

    // Close dropdown on click outside
    const handleOutsideClick = (e) => {
      if (dotsMenuRef.current && !dotsMenuRef.current.contains(e.target)) {
        setShowDotsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line
  }, [isOpen, token]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (selectedFile) {
      const preview = URL.createObjectURL(selectedFile);
      setPreviewUrl(preview);
    } else {
      setPreviewUrl(null);
    }
  };

  const uploadImage = async () => {
    if (!file) return alert(t("select_image_error"));

    const formData = new FormData();
    formData.append("image", file);
    setLoading(true);

    try {
      await axios.put(`${API_BASE_URL}/users/me/profile-image`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);

      fetchProfileImage();
    } catch {
      alert(t("image_upload_error"));
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/users/me/profile-image`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (imageUrl) URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    } catch {
      alert(t("delete_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login/user");
  };

  const handleInfoClick = (titleKey, contentKey) => {
    setActiveInfo({
      isOpen: true,
      title: t(titleKey),
      content: t(contentKey)
    });
    onClose();
  };

  const fetchCoupons = async () => {
    if (showCoupons) {
      setShowCoupons(false);
      return;
    }
    if (!token) {
      console.warn("No token available for fetching coupons");
      return;
    }
    setLoadingCoupons(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/orders/available-coupons?total=0`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(res.data);
      setShowCoupons(true);
    } catch (err) {
      console.error("Error fetching coupons", err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const displayImage = previewUrl || imageUrl;

  return (
    <>
      <div className={`profile-sidebar1 ${isOpen ? "open1" : ""}`}>
        {/* Swiggy One Style Reddish Header Card with Namecard Image */}
        <div
          className="profile-red-header-v3"
          style={{
            backgroundImage: `linear-gradient(135deg, rgb(225 29 72 / 0%), #d4af37), url(${namecardBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="namecard-bg-overlay"></div>
          <div className="header-top-v3">
            <button className="back-btn-sidebar-v3" onClick={() => { onClose(); navigate("/user"); }} aria-label="Close Profile">
              <FiArrowLeft />
            </button>
            <div className="header-actions-right-v3">
              <button className="help-pill-btn-v3" onClick={() => { navigate("/profile/help"); onClose(); }}>
                Help
              </button>

              {/* Three dots dropdown */}
              <div className="three-dots-container-v3" ref={dotsMenuRef}>
                <button className="three-dots-btn-v3" onClick={() => setShowDotsMenu(prev => !prev)} aria-label="More Options">
                  <FiMoreVertical />
                </button>
                {showDotsMenu && (
                  <div className="dots-dropdown-v3 animate__animated animate__fadeIn animate__faster">
                    <button onClick={() => { setIsSettingsOpen(true); setShowDotsMenu(false); }}>
                      <FiSettings /> Settings
                    </button>
                    <button className="logout-action-v3" onClick={handleLogout}>
                      <FiSlash style={{ transform: 'rotate(45deg)' }} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="user-profile-details-v3" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#ffffff',
              color: '#e11d48',
              fontWeight: 'bold',
              fontSize: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              flexShrink: 0
            }}>
              {(profileData.username || localStorage.getItem("username") || "Roy").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="user-name-v3" style={{ margin: 0 }}>Hello, {profileData.username || localStorage.getItem("username") || "Roy"}</h2>
              {profileData.phnno && <p className="user-phone-v3" style={{ margin: 0 }}>{profileData.phnno}</p>}
              {profileData.mail && <p className="user-email-v3" style={{ margin: 0 }}>{profileData.mail}</p>}
            </div>
          </div>
        </div>

        <div className="profile-scroll-content-v3">
          {/* Bitezy One Dynamic Banner */}
          {(() => {
            const isMember = localStorage.getItem('isBitezyOneMember') === 'true';
            const planName = localStorage.getItem('bitezyOnePlan') || '1 Month Pass';
            const expiry = localStorage.getItem('bitezyOneExpiry') || '30 days';

            return (
              <div className="bitezy-one-banner-v3" onClick={() => { navigate("/profile/bitezy-one"); onClose(); }} style={{ cursor: 'pointer' }}>
                <div className="one-banner-left-v3">
                  <span className="one-badge-v3">bitezy <span className="italic-one-v3">one</span></span>
                  <span className={`active-badge-v3 ${!isMember ? 'promo-badge-v3' : ''}`} style={!isMember ? { background: '#f59e0b', color: '#0f172a' } : {}}>
                    {isMember ? 'ACTIVE VIP' : '₹1 LAUNCH DEAL'}
                  </span>
                </div>
                <div className="one-banner-content-v3">
                  <h4>{isMember ? `${planName} Active` : 'Get Bitezy One for ₹1'}</h4>
                  <p>{isMember ? `Saved ₹${userSavings || localStorage.getItem('bitezyOneSavings') || 0} • Valid till ${expiry}` : 'Free delivery on orders > ₹99 & VIP perks'}</p>
                </div>
                <FiChevronRight className="chevron-right-v3" />
              </div>
            );
          })()}

          {/* Quick Action Flex Row Cards */}
          <div className="quick-action-cards-row-v3">
            <div className="action-card-v3" onClick={() => { navigate("/profile/address", { state: { activeTab: "address" } }); onClose(); }}>
              <div className="card-icon-box-v3">
                <FiMapPin />
              </div>
              <span>Saved Address</span>
            </div>
            <div className="action-card-v3" onClick={() => { navigate("/profile/orders", { state: { activeTab: "orders" } }); onClose(); }}>
              <div className="card-icon-box-v3">
                <FiClipboard />
              </div>
              <span>My Orders</span>
            </div>
            <div className="action-card-v3" onClick={() => { navigate("/profile/wishlist", { state: { activeTab: "wishlist" } }); onClose(); }}>
              <div className="card-icon-box-v3">
                <FiHeart />
              </div>
              <span>My Wishlist</span>
            </div>
            <div className="action-card-v3" onClick={() => { navigate("/profile/wallet", { state: { activeTab: "wallet" } }); onClose(); }} style={{ cursor: 'pointer' }}>
              <div className="card-icon-box-v3 wallet-icon-v3">
                <FiSmartphone />
              </div>
              <div className="wallet-card-content-v3">
                <span className="wallet-lbl-v3">Bitezy Money</span>
                <span className="wallet-balance-tag-v3">₹{profileData.walletBalance.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Vertical Menu Options List */}
          <div className="profile-menu-list-v3">
            <div className="list-item-v3" onClick={() => { navigate("/profile/details", { state: { activeTab: "profile" } }); onClose(); }}>
              <div className="item-left-v3">
                <FiUser className="item-icon-v3" />
                <span>My Profile Details</span>
              </div>
              <FiChevronRight className="chevron-right-v3" />
            </div>

            <div className="list-item-v3" onClick={() => { navigate("/profile/vouchers-coupons"); onClose(); }}>
              <div className="item-left-v3">
                <FiTag className="item-icon-v3" />
                <span>My Vouchers & Coupons</span>
              </div>
              <FiChevronRight className="chevron-right-v3" />
            </div>

            <div className="list-item-v3" onClick={() => { navigate("/profile/hidden-restaurants"); onClose(); }}>
              <div className="item-left-v3">
                <FiEyeOff className="item-icon-v3" />
                <span>Hidden Restaurants</span>
              </div>
              <FiChevronRight className="chevron-right-v3" />
            </div>

            <div className="list-item-v3" onClick={() => { navigate("/profile/refer-earn"); onClose(); }}>
              <div className="item-left-v3">
                <FiGift className="item-icon-v3" />
                <span>Refer & Earn</span>
              </div>
              <FiChevronRight className="chevron-right-v3" />
            </div>

            <div className="list-item-v3" onClick={() => { navigate('/profile/terms'); onClose(); }}>
              <div className="item-left-v3">
                <FiFileText className="item-icon-v3" />
                <span>Terms & Conditions</span>
              </div>
              <FiChevronRight className="chevron-right-v3" />
            </div>

            <div className="list-item-v3" onClick={() => { navigate('/profile/privacy'); onClose(); }}>
              <div className="item-left-v3">
                <FiShield className="item-icon-v3" />
                <span>Privacy Policy</span>
              </div>
              <FiChevronRight className="chevron-right-v3" />
            </div>

            <div className="list-item-v3" onClick={() => { navigate("/delivery-partner/register"); onClose(); }}>
              <div className="item-left-v3">
                <FiTruck className="item-icon-v3" />
                <span>Join as Delivery Partner</span>
              </div>
              <FiChevronRight className="chevron-right-v3" />
            </div>

            <div className="list-item-v3" onClick={() => { navigate("/signup/res"); onClose(); }}>
              <div className="item-left-v3">
                <FiShoppingBag className="item-icon-v3" />
                <span>Register Restaurant</span>
              </div>
              <FiChevronRight className="chevron-right-v3" />
            </div>
          </div>
        </div>
      </div>
      {isOpen && <div className="overlay1" onClick={onClose}></div>}
      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <InfoModal
        isOpen={activeInfo.isOpen}
        onClose={() => setActiveInfo({ ...activeInfo, isOpen: false })}
        title={activeInfo.title}
        content={activeInfo.content}
      />
    </>
  );
};

export default ProfileSidebar;
