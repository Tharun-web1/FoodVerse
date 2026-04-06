import React, { useState, useEffect, useRef } from 'react';
import { FiNavigation, FiLoader, FiMapPin } from 'react-icons/fi';
import { useTranslation } from "react-i18next";
import '../UserCss/Address.css';

const Address = ({ formData, setFormData }) => {
    const { t } = useTranslation();
    const [detecting, setDetecting] = useState(false);
    const [predictions, setPredictions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const autocompleteTimeout = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'addressLine') {
            handleAutocomplete(value);
        }
    };

    const handleAutocomplete = (value) => {
        if (!value.trim() || !window.google) {
            setPredictions([]);
            setShowSuggestions(false);
            return;
        }

        if (autocompleteTimeout.current) clearTimeout(autocompleteTimeout.current);

        autocompleteTimeout.current = setTimeout(() => {
            const service = new window.google.maps.places.AutocompleteService();
            service.getPlacePredictions({
                input: value,
                location: new window.google.maps.LatLng(17.3850, 78.4867),
                radius: 50000, // 50km radius around Hyderabad
                strictBounds: true,
                componentRestrictions: { country: 'in' },
                types: ['address']
            }, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                    setPredictions(results);
                    setShowSuggestions(true);
                } else {
                    setPredictions([]);
                }
            });
        }, 300);
    };

    const handleSuggestionSelect = (placeId) => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ placeId }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const place = results[0];
                const extract = (type) => {
                    const comp = place.address_components.find(c => c.types.includes(type));
                    return comp ? comp.long_name : "";
                };

                setFormData(prev => ({
                    ...prev,
                    addressLine: place.formatted_address,
                    city: extract('locality') || extract('administrative_area_level_2'),
                    state: extract('administrative_area_level_1'),
                    zipCode: extract('postal_code'),
                    latitude: place.geometry.location.lat(),
                    longitude: place.geometry.location.lng()
                }));
            }
            setShowSuggestions(false);
        });
    };

    const detectLocation = () => {
        setDetecting(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const geocoder = new window.google.maps.Geocoder();
                        const { results } = await geocoder.geocode({
                            location: { lat: latitude, lng: longitude }
                        });

                        if (results[0]) {
                            const place = results[0];
                            const extract = (type) => {
                                const comp = place.address_components.find(c => c.types.includes(type));
                                return comp ? comp.long_name : "";
                            };

                            setFormData(prev => ({
                                ...prev,
                                addressLine: place.formatted_address,
                                city: extract('locality') || extract('administrative_area_level_2'),
                                state: extract('administrative_area_level_1'),
                                zipCode: extract('postal_code'),
                                latitude,
                                longitude
                            }));
                        }
                    } catch (error) {
                        console.error('Geocoding error:', error);
                        // Fallback just to coordinates if geocoding fails
                        setFormData(prev => ({ ...prev, latitude, longitude }));
                    } finally {
                        setDetecting(false);
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    alert(t("detect_location_error"));
                    setDetecting(false);
                }
            );
        } else {
            alert(t("geolocation_not_supported"));
            setDetecting(false);
        }
    };

    return (
        <div className="manual-address-form-container">
            <div className="form-header-with-action">
                <h3 className="form-subtitle">{t("enter_delivery_details")}</h3>
                <button 
                    type="button" 
                    className="detect-location-btn-mini" 
                    onClick={detectLocation}
                    disabled={detecting}
                >
                    {detecting ? <FiLoader className="spinning" /> : <FiNavigation />}
                    <span>{detecting ? t("detecting") : t("detect_location")}</span>
                </button>
            </div>
            <div className="address-form-grid">
                <div className="form-group full-width relative-group">
                    <label>{t("address_line")}</label>
                    <input
                        type="text"
                        name="addressLine"
                        value={formData.addressLine || ""}
                        onChange={handleInputChange}
                        onFocus={() => predictions.length > 0 && setShowSuggestions(true)}
                        placeholder={t("address_line_placeholder")}
                        required
                        autoComplete="off"
                    />
                    {showSuggestions && predictions.length > 0 && (
                        <div className="autocomplete-suggestions small-shadow">
                            {predictions.map((p) => (
                                <div 
                                    key={p.place_id} 
                                    className="suggestion-item mini-item"
                                    onClick={() => handleSuggestionSelect(p.place_id)}
                                >
                                    <FiMapPin className="suggestion-icon" />
                                    <div className="suggestion-text">
                                        <strong>{p.structured_formatting.main_text}</strong>
                                        <span>{p.structured_formatting.secondary_text}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="form-group">
                    <label>{t("city")}</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city || ""}
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
                        value={formData.state || ""}
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
                        value={formData.zipCode || ""}
                        onChange={handleInputChange}
                        placeholder={t("zip_code_placeholder")}
                        required
                    />
                </div>
            </div>
        </div>
    );
};

export default Address;
