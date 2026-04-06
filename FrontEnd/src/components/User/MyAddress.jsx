import { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiTrash2, FiMapPin, FiCheckCircle, FiHome, FiBriefcase, FiX } from "react-icons/fi";
import LocationSelector from "../User/LocationSelector";
import "../UserCss/MyAddress.css";
import { API_BASE_URL } from "../../api/api";
import { useTranslation } from "react-i18next";

const MyAddress = () => {
    const { t } = useTranslation();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showLocationSelector, setShowLocationSelector] = useState(false);
    const [formData, setFormData] = useState({
        addressLine: "",
        city: "",
        state: "",
        zipCode: "",
        addressType: "HOME",
        isDefault: false,
        latitude: null,
        longitude: null
    });

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchAddresses();
    }, [token]);

    const fetchAddresses = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/users/addresses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddresses(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching addresses", err);
            setLoading(false);
        }
    };

    const handleLocationChange = (location) => {
        setFormData(prev => ({
            ...prev,
            addressLine: location.address,
            city: location.city || prev.city,
            state: location.state || prev.state,
            zipCode: location.zipCode || prev.zipCode,
            latitude: location.lat,
            longitude: location.lng
        }));
        setShowLocationSelector(false);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/users/addresses/add`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowForm(false);
            setFormData({
                addressLine: "",
                city: "",
                state: "",
                zipCode: "",
                addressType: "HOME",
                isDefault: false,
                latitude: null,
                longitude: null
            });
            fetchAddresses();
        } catch (err) {
            alert(t("address_add_error"));
        }
    };

    const deleteAddress = async (id) => {
        if (!window.confirm(t("delete_address_confirm"))) return;
        try {
            await axios.delete(`${API_BASE_URL}/users/addresses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(t("address_deleted_success"));
            fetchAddresses();
        } catch (err) {
            alert(t("address_delete_error"));
        }
    };

    if (loading) return <div className="loader">{t("loading_addresses")}</div>;

    return (
        <div className="my-address-section">
            <div className="address-header">
                <h2>{t("my_addresses")}</h2>
                {!showForm && (
                    <div className="address-header-actions">
                        <LocationSelector onLocationChange={handleLocationChange} />
                        <button className="add-address-btn" onClick={() => setShowForm(true)}>
                            <FiPlus /> {t("add_manual_address")}
                        </button>
                    </div>
                )}
            </div>

            {showForm && (
                <form className="add-address-form" onSubmit={handleSubmit}>
                    <div className="addr-form-header">
                        <h3>{t("add_new_address")}</h3>
                        <div className="form-header-actions">
                            <LocationSelector onLocationChange={handleLocationChange} />
                        </div>
                    </div>
                    <div className="addr-form-grid">
                        <div className="form-group full-width">
                            <label>{t("address_line")}</label>
                            <input
                                type="text"
                                name="addressLine"
                                value={formData.addressLine}
                                onChange={handleInputChange}
                                placeholder={t("address_line_placeholder")}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t("city")}</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder={t("city")}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t("state")}</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                placeholder={t("state")}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t("zip_code")}</label>
                            <input
                                type="text"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleInputChange}
                                placeholder={t("zip_code_placeholder")}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t("address_type")}</label>
                            <select
                                name="addressType"
                                value={formData.addressType}
                                onChange={handleInputChange}
                                className="form-control"
                            >
                                <option value="HOME">{t("home")}</option>
                                <option value="WORK">{t("work")}</option>
                                <option value="OTHER">{t("other")}</option>
                            </select>
                        </div>
                        <div className="form-group full-width" style={{ flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                name="isDefault"
                                id="isDefault"
                                checked={formData.isDefault}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="isDefault" style={{ margin: 0 }}>{t("set_default_address")}</label>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="save-btn">{t("save_address")}</button>
                        <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>{t("cancel")}</button>
                    </div>
                </form>
            )}

            {addresses.length === 0 ? (
                <div className="empty-addresses">
                    <FiMapPin className="empty-icon" />
                    <p>{t("no_addresses_saved")}</p>
                </div>
            ) : (
                <div className="addresses-list">
                    {addresses.map(addr => (
                        <div key={addr.id} className={`address-card ${addr.default ? 'default' : ''}`}>
                            <div className="address-type-badge">
                                {addr.addressType === 'HOME' ? <FiHome /> : <FiBriefcase />}
                                {t(addr.addressType.toLowerCase())}
                            </div>
                            <p className="address-line">{addr.addressLine}</p>
                            <p className="address-details" style={{ fontSize: '14px', color: '#666' }}>
                                {addr.city}, {addr.state} - {addr.zipCode}
                            </p>
                            <div className="address-actions">
                                {addr.default ? (
                                    <span className="default-tag"><FiCheckCircle /> {t("default")}</span>
                                ) : <span />}
                                <button className="delete-addr-btn" onClick={() => deleteAddress(addr.id)}>
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyAddress;