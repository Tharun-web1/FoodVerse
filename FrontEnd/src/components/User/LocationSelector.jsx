import { FiMapPin, FiX, FiNavigation, FiSearch } from 'react-icons/fi';
import { useState, useEffect } from 'react';
// removing @react-google-maps/api Autocomplete import as we will use the service manually
import '../UserCss/LocationSelector.css';
import GoogleMapsLoader from '../Common/GoogleMapsLoader';
import { API_BASE_URL } from '../../api/api';
import { useTranslation } from "react-i18next";


const LocationSelector = ({ onLocationChange, autoDetectOnMobile = false }) => {
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [manualAddress, setManualAddress] = useState('');
    const [detecting, setDetecting] = useState(false);
    const [predictions, setPredictions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setManualAddress(value);

        if (!value.trim()) {
            setPredictions([]);
            setShowSuggestions(false);
            return;
        }

        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions({ 
            input: value,
            location: new window.google.maps.LatLng(17.3850, 78.4867),
            radius: 50000, // 50km radius around Hyderabad
            strictBounds: true,
            componentRestrictions: { country: 'in' }
        }, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                setPredictions(results);
                setShowSuggestions(true);
            } else {
                setPredictions([]);
            }
        });
    };

    const handlePredictionSelect = (prediction) => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const place = results[0];
                const locationData = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    address: place.formatted_address,
                    displayName: prediction.structured_formatting.main_text,
                    city: extractAddressComponent(place, 'locality'),
                    state: extractAddressComponent(place, 'administrative_area_level_1'),
                    zipCode: extractAddressComponent(place, 'postal_code')
                };
                updateAndSaveLocation(locationData);
            }
        });
        setShowSuggestions(false);
    };

    const extractAddressComponent = (place, type) => {
        const component = place.address_components?.find(c => c.types.includes(type));
        return component ? component.long_name : '';
    };

    const updateAndSaveLocation = async (location) => {
        setSelectedLocation(location);
        localStorage.setItem('userLocation', JSON.stringify(location));
        if (onLocationChange) onLocationChange(location);
        await saveToBackend(location);
        setShowModal(false);
    };

    // Load saved location from localStorage
    useEffect(() => {
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
            setSelectedLocation(JSON.parse(savedLocation));
        }
    }, []);

    const saveToBackend = async (locationData) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/users/addresses/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    addressLine: locationData.address,
                    city: locationData.city || 'Unknown',
                    state: locationData.state || 'Unknown',
                    zipCode: locationData.zipCode || '000000',
                    addressType: 'CURRENT',
                    isDefault: true,
                    latitude: locationData.lat,
                    longitude: locationData.lng
                })
            });

            if (!response.ok) {
                console.error('Failed to save address to backend');
            }
        } catch (error) {
            console.error('Error saving address:', error);
        }
    };

    const detectCurrentLocation = () => {
        setDetecting(true);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    try {
                        // Using Google Maps Geocoding instead of Nominatim
                        const geocoder = new window.google.maps.Geocoder();
                        const { results } = await geocoder.geocode({
                            location: { lat: latitude, lng: longitude }
                        });

                        if (results[0]) {
                            const place = results[0];
                            const location = {
                                lat: latitude,
                                lng: longitude,
                                address: place.formatted_address,
                                displayName: extractAddressComponent(place, 'locality') || place.formatted_address.split(',')[0],
                                city: extractAddressComponent(place, 'locality'),
                                state: extractAddressComponent(place, 'administrative_area_level_1'),
                                zipCode: extractAddressComponent(place, 'postal_code')
                            };

                            updateAndSaveLocation(location);
                        } else {
                            throw new Error("No results found");
                        }
                        setDetecting(false);
                    } catch (error) {
                        console.error('Geocoding error:', error);
                        // Fallback
                        const location = {
                            lat: latitude,
                            lng: longitude,
                            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                            displayName: t("current_location")
                        };
                        setSelectedLocation(location);
                        localStorage.setItem('userLocation', JSON.stringify(location));
                        if (onLocationChange) onLocationChange(location);
                        setDetecting(false);
                        setShowModal(false);
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    alert(t("detect_location_manual_error"));
                    setDetecting(false);
                }
            );
        } else {
            alert(t("geolocation_not_supported"));
            setDetecting(false);
        }
    };

    return (
        <LocationDisplay 
            t={t}
            selectedLocation={selectedLocation} 
            setShowModal={setShowModal} 
            showModal={showModal}
            detectCurrentLocation={detectCurrentLocation}
            detecting={detecting}
            manualAddress={manualAddress}
            handleInputChange={handleInputChange}
            predictions={predictions}
            showSuggestions={showSuggestions}
            handlePredictionSelect={handlePredictionSelect}
            autoDetectOnMobile={autoDetectOnMobile}
        />
    );
};

const LocationDisplay = ({ 
    t, selectedLocation, setShowModal, showModal, 
    detectCurrentLocation, detecting, 
    manualAddress, handleInputChange,
    predictions, showSuggestions, handlePredictionSelect,
    autoDetectOnMobile
}) => {
    const handleLocationClick = () => {
        const isMobile = window.innerWidth <= 768;
        if (autoDetectOnMobile && isMobile) {
            detectCurrentLocation();
        } else {
            setShowModal(true);
        }
    };

    return (
        <>
            {/* Location Display Button */}
            <button 
                className={`location-display-btn ${detecting ? 'detecting-active' : ''}`} 
                onClick={handleLocationClick}
                disabled={detecting}
            >
                <FiMapPin className={`location-icon-img ${detecting ? 'spinning' : ''}`} />
                <span className="location-text">
                    {detecting ? t("detecting") + "..." : (selectedLocation ? selectedLocation.displayName : t("select_location"))}
                </span>
            </button>

            {/* Location Modal */}
            {showModal && (
                <div className="location-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="location-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="location-modal-header">
                            <h2>{t("select_delivery_location")}</h2>
                            <button className="close-modal-btn" onClick={() => setShowModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="location-modal-body">
                            {/* Detect Location Button */}
                            <button
                                className="detect-location-btn"
                                onClick={detectCurrentLocation}
                                disabled={detecting}
                            >
                                <FiNavigation className={detecting ? 'spinning' : ''} />
                                <div>
                                    <strong>{detecting ? t("detecting") : t("detect_current_location")}</strong>
                                    <p>{t("using_gps")}</p>
                                </div>
                            </button>

                            <div className="divider">
                                <span>{t("or")}</span>
                            </div>

                            {/* Manual Address Input with Custom Autocomplete */}
                            <div className="manual-location-section">
                                <label>{t("search_delivery_address")}</label>
                                <div className="search-input-wrapper">
                                    <FiSearch className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder={t("search_location_placeholder")}
                                        className="address-input"
                                        value={manualAddress}
                                        onChange={handleInputChange}
                                        onFocus={() => predictions.length > 0 && setShowSuggestions(true)}
                                    />
                                    
                                    {showSuggestions && predictions.length > 0 && (
                                        <div className="autocomplete-suggestions">
                                            {predictions.map((p) => (
                                                <div 
                                                    key={p.place_id} 
                                                    className="suggestion-item"
                                                    onClick={() => handlePredictionSelect(p)}
                                                >
                                                    <FiMapPin className="suggestion-icon-img" />
                                                    <div className="suggestion-text">
                                                        <strong>{p.structured_formatting.main_text}</strong>
                                                        <span>{p.structured_formatting.secondary_text}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Current Selected Location */}
                            {selectedLocation && (
                                <div className="current-location-display">
                                    <FiMapPin className="active-location-icon-img" />
                                    <div>
                                        <strong>{t("active_location")}</strong>
                                        <p>{selectedLocation.address}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LocationSelector;
