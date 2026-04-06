import React, { createContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { API_BASE_URL } from "../api/api";

export const RestaurantOrderContext = createContext();

export const RestaurantOrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const previousOrdersRef = useRef([]);
    const audioRef = useRef(null);

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio('../assets/ringtone/notification.mp3');
    }, []);

    const isValidId = (id) => id && id !== "undefined" && id !== "null";

    const fetchOrders = async () => {
        const token = localStorage.getItem("restaurant_token");
        const restaurantId = localStorage.getItem("restaurantId");

        if (!isValidId(token) || !isValidId(restaurantId)) {
            if (orders.length > 0) setOrders([]);
            return;
        }

        try {
            const response = await api.get(`/orders/restaurant/${restaurantId}`);

            const currentOrders = response.data;
            const previousOrders = previousOrdersRef.current;

            if (previousOrders.length > 0) {
                // Check for ANY new order that is PENDING
                // We compare IDs to see if we have a new entry
                const newOrders = currentOrders.filter(co =>
                    !previousOrders.find(po => po.id === co.id) &&
                    (co.status === 'PENDING' || co.status === 'PLACED' || co.status === 'PAID')
                );

                if (newOrders.length > 0) {
                    newOrders.forEach(order => {
                        toast.info(`New Order! Order #${order.id}`, {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            theme: "colored",
                        });

                        // Play sound
                        if (audioRef.current) {
                            audioRef.current.play().catch(e => console.error("Audio play failed", e));
                        }
                    });
                }
            }

            // Update state and ref
            setOrders(currentOrders);
            previousOrdersRef.current = currentOrders;

        } catch (error) {
            console.error("Context: Error fetching orders", error);
            if (error.response?.status === 401) {
                // Token is likely expired or invalid, clear it to stop polling successfully
                localStorage.removeItem("restaurant_token");
                localStorage.removeItem("restaurantId");
                setOrders([]);
            }
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchOrders();

        // Poll every 10 seconds for real-time responsiveness
        const intervalId = setInterval(fetchOrders, 10000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <RestaurantOrderContext.Provider value={{ orders, fetchOrders }}>
            {children}
            {/* Context handles the ToastContainer so it's globally available */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </RestaurantOrderContext.Provider>
    );
};
