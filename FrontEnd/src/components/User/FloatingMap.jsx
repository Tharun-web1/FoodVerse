import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, Marker, DirectionsRenderer, Circle } from '@react-google-maps/api';
import { FiX, FiMaximize2, FiMinimize2, FiTruck, FiNavigation } from 'react-icons/fi';
import { API_BASE_URL } from '../../api/api';
import '../UserCss/FloatingMap.css';
import { useAuth } from '../../context/AuthContext';
import restaurantMarker from '../../assets/images/restaurant-marker.png';
import userMarker from '../../assets/images/location-marker.png';
import riderMarker from '../../assets/images/rider-marker.png';
import { useTranslation } from "react-i18next";

const FloatingMap = () => {
    const { t } = useTranslation();
    const { token, isAuthenticated } = useAuth();
    const [order, setOrder] = useState(null);
    const [riderLocation, setRiderLocation] = useState(null);
    const [directions, setDirections] = useState(null);
    const [pulseRadius, setPulseRadius] = useState(50);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();

    // 🛡️ Path-based Visibility Guard
    const isExcludedPath = () => {
        const path = location.pathname;
        return (
            path.startsWith('/delivery') || 
            path.startsWith('/res') || 
            path.startsWith('/login') || 
            path.startsWith('/signup') ||
            path === '/orders' ||
            path.startsWith('/order-summary')
        );
    };

    const fetchActiveOrder = async () => {
        const validToken = token && token !== 'null' && token !== 'undefined';
        if (!validToken || !isAuthenticated || isExcludedPath()) {
            setIsVisible(false);
            setOrder(null);
            return;
        }

        try {
            const res = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const active = res.data.find(o => 
                o.status && ['out_for_delivery', 'preparing', 'placed'].includes(o.status.toLowerCase())
            );
            
            if (active) {
                setOrder(active);
                setIsVisible(true);
            } else {
                setIsVisible(false);
                setOrder(null);
            }
        } catch (err) {
            console.error("Error fetching active order for floating map:", err);
            setIsVisible(false);
        }
    };

    useEffect(() => {
        fetchActiveOrder();
        const interval = setInterval(fetchActiveOrder, 30000);
        return () => clearInterval(interval);
    }, [token, location.pathname, isAuthenticated]);

    // Live Tracking Polling
    useEffect(() => {
        let interval;
        if (isVisible && order && (order.status === 'OUT_FOR_DELIVERY' || order.status === 'PREPARING')) {
            const fetchRiderLocation = async () => {
                try {
                    const res = await axios.get(`${API_BASE_URL}/delivery-orders/${order.id}/rider-location`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data) setRiderLocation(res.data);
                } catch (err) {
                    console.error("Error fetching rider location:", err);
                }
            };
            fetchRiderLocation();
            interval = setInterval(fetchRiderLocation, 10000);
        }
        return () => clearInterval(interval);
    }, [isVisible, order?.id, order?.status, token]);

    // Direction Route
    useEffect(() => {
        if (isVisible && order?.deliveryLatitude && window.google) {
            const directionsService = new window.google.maps.DirectionsService();
            let originObj = null;
            if (riderLocation?.lat && riderLocation?.lng) {
                originObj = new window.google.maps.LatLng(riderLocation.lat, riderLocation.lng);
            } else if (order.restaurantLatitude && order.restaurantLongitude) {
                originObj = new window.google.maps.LatLng(order.restaurantLatitude, order.restaurantLongitude);
            }
            if (!originObj) return;
            const destinationObj = new window.google.maps.LatLng(order.deliveryLatitude, order.deliveryLongitude);

            directionsService.route(
                {
                    origin: originObj,
                    destination: destinationObj,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        setDirections(result);
                    }
                }
            );
        }
    }, [isVisible, order?.deliveryLatitude, riderLocation]);

    // Pulse
    useEffect(() => {
        if (!riderLocation) return;
        const pulseInterval = setInterval(() => {
            setPulseRadius(prev => (prev >= 150 ? 50 : prev + 10));
        }, 100);
        return () => clearInterval(pulseInterval);
    }, [riderLocation]);

    if (!isVisible || !order) return null;

    return (
        <div className={`floating-map-widget ${isMinimized ? 'minimized' : 'expanded'}`}>
            <div className="floating-map-header">
                <div className="order-info-mini">
                    <FiTruck className="truck-icon" />
                    <div className="status-text">
                        <span className="label">{t("live_tracking")}</span>
                        <span className="value">{order.restaurantName}</span>
                    </div>
                </div>
                <div className="controls">
                    <button onClick={() => setIsMinimized(!isMinimized)} title={isMinimized ? t("expand") : t("minimize")}>
                        {isMinimized ? <FiMaximize2 /> : <FiMinimize2 />}
                    </button>
                    <button onClick={() => setIsVisible(false)} title={t("dismiss")}>
                        <FiX />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <div className="floating-map-body">
                    <GoogleMap
                        mapContainerClassName="mini-track-map"
                        center={riderLocation || { lat: order.deliveryLatitude, lng: order.deliveryLongitude }}
                        zoom={15}
                        options={{
                            disableDefaultUI: true,
                            styles: [
                                { featureType: "all", elementType: "geometry", stylers: [{ color: "#1a1c2c" }] },
                                { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }, { visibility: "on" }] },
                                { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8db8" }] },
                                { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
                                { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] }
                            ]
                        }}
                    >
                        {directions && <DirectionsRenderer directions={directions} options={{ polylineOptions: { strokeColor: "#fc8019", strokeWeight: 3 }, suppressMarkers: true }} />}
                        
                        {order.deliveryLatitude && (
                             <Marker 
                                position={{ lat: order.deliveryLatitude, lng: order.deliveryLongitude }} 
                                title={t("your_location")}
                                icon={{
                                    url: userMarker,
                                    scaledSize: new window.google.maps.Size(40, 40),
                                    origin: new window.google.maps.Point(0, 0),
                                    anchor: new window.google.maps.Point(20, 20)
                                }}
                            />
                        )}
                        
                        {riderLocation && (
                            <>
                                <Marker 
                                    position={riderLocation} 
                                    title={t("delivery_partner")}
                                    icon={{
                                        url: riderMarker,
                                        scaledSize: new window.google.maps.Size(45, 45),
                                        origin: new window.google.maps.Point(0, 0),
                                        anchor: new window.google.maps.Point(22, 22)
                                    }}
                                />
                                <Circle center={riderLocation} radius={pulseRadius/2} options={{ fillColor: "#fc8019", fillOpacity: 0.2, strokeOpacity: 0, clickable: false }} />
                            </>
                        )}
                    </GoogleMap>
                    <div className="map-footer">
                        <Link to={`/order-summary/${order.id}`} className="track-button">
                            {t("track_order")} <FiNavigation />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FloatingMap;
