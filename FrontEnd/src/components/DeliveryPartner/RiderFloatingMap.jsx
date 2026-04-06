import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleMap, Marker, DirectionsRenderer, Circle } from '@react-google-maps/api';
import { FiX, FiMaximize2, FiMinimize2, FiNavigation, FiMapPin } from 'react-icons/fi';
import { useAuth } from './AuthContext';
import api from '../../services/api';
import GoogleMapsLoader from '../Common/GoogleMapsLoader';
import restaurantMarker from '../../assets/images/restaurant-marker.png';
import userMarker from '../../assets/images/location-marker.png';
import riderMarker from '../../assets/images/rider-marker.png';
import './RiderFloatingMap.css';

const RiderFloatingMap = () => {
    const auth = useAuth();
    const user = auth?.user;
    const riderLocation = auth?.location;
    
    const [activeOrder, setActiveOrder] = useState(null);
    const [directions, setDirections] = useState(null);
    const [pulseRadius, setPulseRadius] = useState(50);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // 🛡️ Path-based Visibility Guard
    const isExcludedPath = () => {
        const path = location.pathname;
        return (
            path.startsWith('/delivery/order/') || 
            path === '/delivery/login' || 
            path === '/delivery/register'
        );
    };

    useEffect(() => {
        const fetchActiveOrder = async () => {
            if (!user?.id) return;
            try {
                const res = await api.get(`/delivery-orders/partner/${user.id}`);
                
                // 🛡️ Defensive check & Parse
                let rawData = res.data;
                if (typeof rawData === 'string') {
                    try {
                        rawData = JSON.parse(rawData);
                    } catch (e) {
                        console.error("Failed to parse response as JSON", e);
                    }
                }

                if (!Array.isArray(rawData)) {
                    console.error("Unexpected response format from /delivery-orders/partner/ (Expected array/List):", rawData);
                    setActiveOrder(null);
                    setIsVisible(false);
                    return;
                }

                const active = rawData.find(o => ['ACCEPTED', 'PICKED_UP'].includes(o.status));
                setActiveOrder(active);
                setIsVisible(!!active && !isExcludedPath());
            } catch (err) {
                console.error("Failed to fetch active order", err);
                setIsVisible(false);
                setActiveOrder(null);
            }
        };

        fetchActiveOrder();
        const interval = setInterval(fetchActiveOrder, 30000);
        return () => clearInterval(interval);
    }, [user, location.pathname]);

    useEffect(() => {
        if (activeOrder && riderLocation?.lat && window.google) {
            const directionsService = new window.google.maps.DirectionsService();
            const destination = activeOrder.status === 'PICKED_UP' 
                ? { lat: activeOrder.deliveryLatitude, lng: activeOrder.deliveryLongitude }
                : { lat: activeOrder.restaurantLatitude, lng: activeOrder.restaurantLongitude };

            if (!destination.lat || !destination.lng) return;

            directionsService.route(
                {
                    origin: { lat: riderLocation.lat, lng: riderLocation.lng },
                    destination: destination,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        setDirections(result);
                    } else {
                         setDirections(null);
                    }
                }
            );
        } else {
            setDirections(null);
        }
    }, [activeOrder, riderLocation, window.google]);

    useEffect(() => {
        const pulseInterval = setInterval(() => {
            setPulseRadius(prev => (prev >= 150 ? 50 : prev + 10));
        }, 100);
        return () => clearInterval(pulseInterval);
    }, []);

    if (!isVisible || !activeOrder) return null;

    return (
        <div className={`rider-floating-map ${isMinimized ? 'minimized' : 'expanded'}`}>
            <div className="map-header">
                <div className="order-summary-mini">
                    <FiMapPin className="pin-icon" />
                    <div className="dest-info">
                        <span className="label">{activeOrder.status === 'PICKED_UP' ? 'Delivery Address' : 'Pickup Point'}</span>
                        <span className="value">
                            {activeOrder.status === 'PICKED_UP' ? (activeOrder.deliveryAddress || 'Customer') : (activeOrder.restaurantName || 'Restaurant')}
                        </span>
                    </div>
                </div>
                <div className="controls">
                    <button onClick={() => setIsMinimized(!isMinimized)}>
                        {isMinimized ? <FiMaximize2 /> : <FiMinimize2 />}
                    </button>
                    <button onClick={() => setIsVisible(false)}>
                        <FiX />
                    </button>
                </div>
            </div>

            <div className="map-body">
                <GoogleMapsLoader>
                    <GoogleMap
                        mapContainerClassName="mini-rider-map"
                        center={{ lat: riderLocation?.lat || activeOrder.restaurantLatitude, lng: riderLocation?.lng || activeOrder.restaurantLongitude }}
                        zoom={14}
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
                        {directions && (
                            <DirectionsRenderer 
                                directions={directions} 
                                options={{
                                    polylineOptions: { strokeColor: "#00d2ff", strokeWeight: 4 },
                                    suppressMarkers: true
                                }} 
                            />
                        )}
                        
                        <Marker 
                            position={activeOrder.status === 'PICKED_UP' 
                                ? { lat: activeOrder.deliveryLatitude, lng: activeOrder.deliveryLongitude }
                                : { lat: activeOrder.restaurantLatitude, lng: activeOrder.restaurantLongitude }
                            }
                            icon={{
                                url: activeOrder.status === 'PICKED_UP' ? userMarker : restaurantMarker,
                                scaledSize: new window.google.maps.Size(40, 40),
                                origin: new window.google.maps.Point(0, 0),
                                anchor: new window.google.maps.Point(20, 20)
                            }}
                        />

                        {riderLocation?.lat && (
                            <>
                                <Marker 
                                    position={{ lat: riderLocation.lat, lng: riderLocation.lng }}
                                    icon={{
                                        url: riderMarker,
                                        scaledSize: new window.google.maps.Size(45, 45),
                                        origin: new window.google.maps.Point(0, 0),
                                        anchor: new window.google.maps.Point(22, 22)
                                    }}
                                />
                                <Circle center={{ lat: riderLocation.lat, lng: riderLocation.lng }} radius={pulseRadius} options={{ fillColor: "#00d2ff", fillOpacity: 0.1, strokeOpacity: 0, clickable: false }} />
                            </>
                        )}
                    </GoogleMap>
                </GoogleMapsLoader>

                <div className="map-actions">
                    <button className="navigate-btn" onClick={() => navigate(`/delivery/order/${activeOrder.id}`)}>
                        <FiNavigation />
                        <span>View Details</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RiderFloatingMap;
