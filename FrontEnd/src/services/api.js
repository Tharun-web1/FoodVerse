import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        const deliveryToken = localStorage.getItem('delivery_token');
        const restaurantToken = localStorage.getItem('restaurant_token');
        const userToken = localStorage.getItem('token');
        
        const isValidToken = (t) => t && t !== 'null' && t !== 'undefined';
        
        let token = null;
        
        // Prioritize token based on target API features
        if (config.url.includes('/partner/') || config.url.includes('/delivery-')) {
            token = isValidToken(deliveryToken) ? deliveryToken : (isValidToken(restaurantToken) ? restaurantToken : (isValidToken(userToken) ? userToken : null));
        } else if (config.url.includes('/restaurants/') || config.url.includes('/res/') || config.url.includes('/orders/restaurant/') || config.url.includes('/status')) {
            token = isValidToken(restaurantToken) ? restaurantToken : (isValidToken(userToken) ? userToken : null);
        } else {
            token = isValidToken(userToken) ? userToken : null;
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
