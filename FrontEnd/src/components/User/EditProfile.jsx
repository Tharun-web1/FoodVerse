import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiEdit2 } from "react-icons/fi";
import "../UserCss/EditProfile.css";
import { API_BASE_URL } from "../../api/api"; 
import { useTranslation } from "react-i18next";

const EditProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    username: "",
    mail: "",
    phnno: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/users/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setForm({
          username: res.data.username || "",
          mail: res.data.mail || "",
          phnno: res.data.phnno || "",
          walletBalance: res.data.walletBalance || 0,
        });
      } catch (err) {
        setMessage(t("failed_load_profile"));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, t]);

  /* ================= INPUT CHANGE ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= SAVE PROFILE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await axios.put(
        `${API_BASE_URL}/users/me`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(t("profile_updated_success", "Profile updated successfully!"));
      setIsEditing(false);
    } catch (err) {
      setMessage(t("update_failed", "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="profile-loader">{t("loading_profile")}</div>;

  return (
    <div className="edit-profile">
      <div className="profile-details-header">
        <div className="profile-title-container">
          <button className="back-btn-profile" onClick={() => navigate("/profile")} aria-label="Go Back">
            <FiArrowLeft />
          </button>
          <h2>{t("profile_details", "My Profile Details")}</h2>
        </div>
        {!isEditing && (
          <button className="edit-profile-toggle-btn" onClick={() => setIsEditing(true)} aria-label="Edit Profile">
            <FiEdit2 /> <span>{t("edit", "Edit")}</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label>{t("username")}</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>{t("email")}</label>
            <input
              type="email"
              name="mail"
              value={form.mail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group disabled-group">
            <label>{t("phone_number")}</label>
            <input
              type="tel"
              name="phnno"
              value={form.phnno}
              disabled
              className="disabled-input"
            />
            <span className="input-hint">{t("phone_number_uneditable", "Phone number cannot be modified")}</span>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-profile-btn" disabled={saving}>
              {saving ? t("saving") : t("save_changes")}
            </button>
            <button type="button" className="cancel-profile-btn" onClick={() => setIsEditing(false)}>
              {t("cancel")}
            </button>
          </div>

          {message && <p className="form-message success">{message}</p>}
        </form>
      ) : (
        <div className="profile-details-display">
          <div className="display-group">
            <span className="display-label">{t("username")}</span>
            <span className="display-value">{form.username || "—"}</span>
          </div>

          <div className="display-group">
            <span className="display-label">{t("email")}</span>
            <span className="display-value">{form.mail || "—"}</span>
          </div>

          <div className="display-group">
            <span className="display-label">{t("phone_number")}</span>
            <span className="display-value">{form.phnno || "—"}</span>
          </div>
          
          {message && <p className="form-message success">{message}</p>}
        </div>
      )}
    </div>
  );
};

export default EditProfile;
