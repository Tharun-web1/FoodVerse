import { useEffect, useState } from "react";
import axios from "axios";
import "../UserCss/EditProfile.css";
import { API_BASE_URL } from "../../api/api"; 
import { useTranslation } from "react-i18next";

const EditProfile = () => {
    const { t } = useTranslation();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    username: "",
    mail: "",
    phnno: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

      setMessage(t("profile_updated_success"));
    } catch (err) {
      setMessage(t("update_failed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="profile-loader">{t("loading_profile")}</div>;

  return (
    <div className="edit-profile">
      <h2>{t("edit_profile")}</h2>

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

        <div className="form-group">
          <label>{t("phone_number")}</label>
          <input
            type="tel"
            name="phnno"
            value={form.phnno}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? t("saving") : t("save_changes")}
        </button>

        {message && <p className="form-message">{message}</p>}
      </form>
    </div>
  );
};

export default EditProfile;
