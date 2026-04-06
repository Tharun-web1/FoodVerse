import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiMapPin } from 'react-icons/fi';
import './GoogleAutocompleteInput.css';

const GoogleAutocompleteInput = ({ 
    value, 
    onChange, 
    onPlaceSelected, 
    placeholder = "Search address...",
    className = "form-control"
}) => {
    const [predictions, setPredictions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    // Handle clicks outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        onChange(newValue);

        if (!newValue.trim()) {
            setPredictions([]);
            setShowSuggestions(false);
            return;
        }

        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions({ 
            input: newValue,
            location: new window.google.maps.LatLng(17.3850, 78.4867),
            radius: 50000, 
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

    const handleSelect = (prediction) => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const place = results[0];
                onPlaceSelected({
                    formatted_address: place.formatted_address,
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    main_text: prediction.structured_formatting.main_text,
                    address_components: place.address_components
                });
            }
        });
        setShowSuggestions(false);
    };

    return (
        <div className="google-autocomplete-wrapper" ref={wrapperRef}>
            <div className="input-with-icon">
                <FiSearch className="search-icon-input" />
                <input
                    type="text"
                    className={className}
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => predictions.length > 0 && setShowSuggestions(true)}
                    placeholder={placeholder}
                />
            </div>

            {showSuggestions && predictions.length > 0 && (
                <div className="autocomplete-dropdown">
                    {predictions.map((p) => (
                        <div 
                            key={p.place_id} 
                            className="suggestion-row"
                            onClick={() => handleSelect(p)}
                        >
                             <FiMapPin className="row-icon-img" />
                            <div className="row-content">
                                <span className="main-text">{p.structured_formatting.main_text}</span>
                                <span className="secondary-text">{p.structured_formatting.secondary_text}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GoogleAutocompleteInput;
