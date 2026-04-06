import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from 'react-i18next';
import "../UserCss/ProfileSidebar.css";
import { API_BASE_URL } from "../../api/api";
import InfoModal from "./InfoModal";
import LanguagePicker, { languages } from "./LanguagePicker";
import { FiCamera, FiTrash2, FiX, FiUser, FiSettings, FiTag, FiTruck, FiShoppingBag, FiMessageSquare, FiHelpCircle, FiInfo, FiFileText, FiShield, FiRotateCcw, FiSlash, FiGlobe } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import Settings from "./Settings";

const ProfileSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { t, i18n } = useTranslation();
  const { user, token, logout } = useAuth();
  const username = user ? user.username : "User";

  const [imageUrl, setImageUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLangPickerOpen, setIsLangPickerOpen] = useState(false);
  const [activeInfo, setActiveInfo] = useState({ isOpen: false, title: '', content: '' });

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

  useEffect(() => {
    if (isOpen) {
      fetchProfileImage();
    }
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line
  }, [isOpen]);

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
    if (window.confirm(t("logout_confirm"))) {
      logout();
      onClose();
      navigate("/login/user");
    }
  };

  const handleInfoClick = (titleKey, contentKey) => {
    setActiveInfo({
      isOpen: true,
      title: t(titleKey),
      content: t(contentKey)
    });
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
        <div className="sidebar-header1">
          <div className="close-btn1" onClick={onClose}><FiX /></div>
        </div>

        <div className="profile-info1">
          <div className="profile-image-wrapper1">
            {displayImage ? (
              <img src={displayImage} alt="Profile" className="profile-image1" />
            ) : (
              <div className="profile-icon1">
                <FiUser />
              </div>
            )}

            <div className="profile-overlay1">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                hidden
                onChange={handleFileChange}
              />
              <button
                className="profile-action-icon1"
                onClick={() => fileInputRef.current.click()}
              >
                <FiCamera />
              </button>
              {imageUrl && (
                <button
                  className="profile-action-icon1 delete1"
                  onClick={deleteImage}
                  disabled={loading}
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          </div>

          <h3>{t('hello')}, {username}</h3>

          {previewUrl && (
            <button
              className="save-photo-btn1"
              onClick={uploadImage}
              disabled={loading}
            >
              {loading ? t("saving") : t("save_photo")}
            </button>
          )}
        </div>

        <div className="profile-page1">
          <h2>{t('general')}</h2>
          <div className="card11">
            <div className="card-item1" onClick={() => { navigate("/profile"); onClose(); }}>
              <FiUser />
              <span>{t('my_profile')}</span>
            </div>
            <div className="card-item1" onClick={() => { setIsSettingsOpen(true); onClose(); }}>
              <FiSettings />
              <span>{t('settings')}</span>
            </div>
            <div className="card-item1" onClick={() => setIsLangPickerOpen(true)}>
              <FiGlobe />
              <div className="lang-item-content">
                <span>{t('language')}</span>
                <span className="current-lang-tag">{languages.find(l => l.code === i18n.language)?.name}</span>
              </div>
            </div>
          </div>

          <h2>{t('promotions')}</h2>
          <div className="card11">
            <div className="card-item1" onClick={fetchCoupons}>
              <FiTag />
              <span>{t('coupons')}</span>
            </div>
            {loadingCoupons && <div className="loading-coupons1">{t("checking_offers")}</div>}
            {showCoupons && (
              <div className="coupons-container1">
                {coupons.length > 0 ? (
                  coupons.map(cp => (
                    <div key={cp.code} className="sidebar-coupon-item1">
                      <span className="sidebar-coupon-code1">{cp.code}</span>
                      <span className="sidebar-coupon-desc1">{cp.description}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-coupons1">{t("no_coupons_available")}</div>
                )}
              </div>
            )}
          </div>

          <h2>{t('earnings')}</h2>
          <div className="card11">
            <div className="card-item1" onClick={() => { navigate("/delivery/register"); onClose(); }}>
              <FiTruck />
              <span>{t('join_delivery')}</span>
            </div>
            <div className="card-item1" onClick={() => { navigate("/signup/res"); onClose(); }}>
              <FiShoppingBag />
              <span>{t('open_restaurant')}</span>
            </div>
          </div>

          <h2>{t('help_support')}</h2>
          <div className="card11">
            <div className="card-item1" onClick={() => { navigate("/live-chat"); onClose(); }}>
              <FiMessageSquare />
              <span>{t('live_chat')}</span>
            </div>
            <div className="card-item1" onClick={() => handleInfoClick('help_support', 'about_us_content')}>
              <FiHelpCircle />
              <span>{t('help_support')}</span>
            </div>
            <div className="card-item1" onClick={() => handleInfoClick('about_us', 'about_us_content')}>
              <FiInfo />
              <span>{t('about_us')}</span>
            </div>
            <div className="card-item1" onClick={() => handleInfoClick('terms_conditions', 'terms_content')}>
              <FiFileText />
              <span>{t('terms_conditions')}</span>
            </div>
            <div className="card-item1" onClick={() => handleInfoClick('privacy_policy', 'privacy_content')}>
              <FiShield />
              <span>{t('privacy_policy')}</span>
            </div>
            <div className="card-item1" onClick={() => handleInfoClick('refund_policy', 'refund_content')}>
              <FiRotateCcw />
              <span>{t('refund_policy')}</span>
            </div>
            <div className="card-item1" onClick={() => handleInfoClick('cancellation_policy', 'cancellation_content')}>
              <FiSlash />
              <span>{t('cancellation_policy')}</span>
            </div>
          </div>

          <h2 style={{ marginTop: '24px', color: '#ff3359' }}>{t("account")}</h2>
          <div className="card11 no-border">
            <div className="card-item1 logout-item" onClick={handleLogout}>
              <FiSlash style={{ transform: 'rotate(45deg)', color: '#ff3359' }} />
              <span style={{ color: '#ff3359', fontWeight: '700' }}>{t('logout')}</span>
            </div>
          </div>
        </div>
      </div>
      {isOpen && <div className="overlay1" onClick={onClose}></div>}
      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <LanguagePicker isOpen={isLangPickerOpen} onClose={() => setIsLangPickerOpen(false)} />
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
