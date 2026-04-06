import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import api from '../../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState({ address: 'Locating...', lat: null, lng: null });

    const detectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        // Reverse Geocoding using BigDataCloud API (Free, no CORS issues for client-side)
                        const response = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);

                        // Construct address from response
                        // Example response: { locality: "Hyderabad", principalSubdivision: "Telangana", countryName: "India", ... }
                        const data = response.data;
                        const address = [data.locality, data.principalSubdivision, data.countryName]
                            .filter(Boolean)
                            .join(', ');

                        setLocation({ address, lat: latitude, lng: longitude });
                    } catch (error) {
                        console.error("Geocoding failed", error);
                        setLocation({ address: 'Location unavailable', lat: null, lng: null });
                    }
                },
                (error) => {
                    console.error("Location permission denied", error);
                    setLocation({ address: 'Permission denied', lat: null, lng: null });
                }
            );
        } else {
            setLocation({ address: 'Not supported', lat: null, lng: null });
        }
    };

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('delivery_token');
            if (token) {
                try {
                    const response = await api.get('/partner/profile');
                    setUser(response.data);
                    detectLocation();
                } catch (error) {
                    console.error("Auth check failed", error);
                    localStorage.removeItem('delivery_token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    const refreshProfile = async () => {
        try {
            const response = await api.get('/partner/profile');
            setUser(response.data);
            return response.data;
        } catch (error) {
            console.error("Profile refresh failed", error);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/partner/auth/login', { email, password });

            // Backend returns a simple String as token
            const token = response.data;
            localStorage.setItem('delivery_token', token);

            // Fetch user profile immediately after login
            const profileResponse = await api.get('/partner/profile');
            const userData = profileResponse.data;
            setUser(userData);
            detectLocation();

            // Check if vehicle details satisfy the requirement (assuming vehicleNumber or similar field exists, or the original flag)
            const hasDetails = userData.hasVehicleDetails || (userData.vehicleNumber && userData.vehicleType);
            return { success: true, hasVehicleDetails: !!hasDetails };
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const register = async (userData) => {
        const response = await api.post('/partner/auth/register', userData);
        // Backend returns UserEntity, not token + user. 
        // User must login after registration.
        return response.data;
    };

    const updateVehicleDetails = async (details) => {
        console.log("Updating vehicle details...", details);
        const response = await api.post('/partner/vehicle', details);
        setUser(response.data);
        return true;
    };

    const updateAvailability = async (available) => {
        if (!user) return;
        try {
            const response = await api.put(`/partner/auth/availability/${user.id}`, null, {
                params: { available }
            });
            setUser(response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to update availability", error);
            throw error;
        }
    };

    const uploadLicenseImage = async (id, file) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await api.post(`/partner/auth/BikeLicence/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error("License upload failed", error);
            throw error;
        }
    };

    const uploadPanImage = async (id, file) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await api.post(`/partner/auth/pan/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error("PAN upload failed", error);
            throw error;
        }
    };

    const uploadAadhaarImage = async (id, file) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await api.post(`/partner/auth/adhaar/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error("Aadhaar upload failed", error);
            throw error;
        }
    };

    const updateDocumentNumbers = async (data) => {
        try {
            const response = await api.post('/partner/documents', data);
            setUser(response.data);
            return true;
        } catch (error) {
            console.error("Failed to update document numbers", error);
            throw error;
        }
    };

    const updateBankDetails = async (data) => {
        try {
            const response = await api.post('/partner/bank', data);
            setUser(response.data);
            return true;
        } catch (error) {
            console.error("Failed to update bank details", error);
            throw error;
        }
    };


    const uploadProfileImage = async (id, file) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await api.post(`/partner/auth/userimg/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error("Profile image upload failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('delivery_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, location, login, register, updateVehicleDetails, updateDocumentNumbers, updateBankDetails, updateAvailability, logout, loading, uploadLicenseImage, uploadPanImage, uploadAadhaarImage, uploadProfileImage, detectLocation, refreshProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);