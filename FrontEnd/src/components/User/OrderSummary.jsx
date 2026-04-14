import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiX, FiCalendar, FiMapPin, FiTruck, FiCreditCard, FiHome, FiCheckCircle, FiClock, FiShoppingBag, FiInfo, FiArrowLeft, FiNavigation } from 'react-icons/fi';
import { GoogleMap, Marker, DirectionsRenderer, Circle } from '@react-google-maps/api';
import { API_BASE_URL } from '../../api/api';
import Navbar from './Navbar';
import restaurantMarker from '../../assets/images/restaurant-marker.png';
import userMarker from '../../assets/images/location-marker.png';
import riderMarker from '../../assets/images/rider-marker.png';
import { useTranslation } from "react-i18next";

import '../UserCss/OrderSummary.css';

const OrderSummary = ({ order: propOrder, onClose, isModal = false }) => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(propOrder || null);
    const [loading, setLoading] = useState(!propOrder && !!id);
    const [riderLocation, setRiderLocation] = useState(null);
    const [directions, setDirections] = useState(null);
    const [pulseRadius, setPulseRadius] = useState(50);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (propOrder) {
                setOrder(propOrder);
                setLoading(false);
                return;
            }

            if (!id || !token) {
                setLoading(false);
                return;
            }

            try {
                // Since there might not be a direct get-by-id, we fetch all and find
                const res = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const foundOrder = res.data.find(o => o.id === parseInt(id) || o.transaction_id === id);
                if (foundOrder) {
                    setOrder(foundOrder);
                } else {
                    console.error("Order not found");
                }
            } catch (err) {
                console.error("Error fetching order details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id, propOrder, token]);

    // Live Tracking Polling
    useEffect(() => {
        let interval;
        if (order?.status === 'OUT_FOR_DELIVERY' || order?.status === 'PREPARING') {
            const fetchRiderLocation = async () => {
                try {
                    const res = await axios.get(`${API_BASE_URL}/delivery-orders/${order.id}/rider-location`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data) {
                        setRiderLocation(res.data);
                    }
                } catch (err) {
                    console.error("Error fetching rider location:", err);
                }
            };

            fetchRiderLocation();
            interval = setInterval(fetchRiderLocation, 10000); // Poll every 10 seconds
        }
        return () => clearInterval(interval);
    }, [order?.status, order?.id, token]);

    // 🏎️ Pulse Animation for Rider
    useEffect(() => {
        if (!riderLocation) return;
        const pulseInterval = setInterval(() => {
            setPulseRadius(prev => (prev >= 150 ? 50 : prev + 10));
        }, 100);
        return () => clearInterval(pulseInterval);
    }, [riderLocation]);

    // 🛣️ Fetch Directions Route (Rider to User)
    useEffect(() => {
        if (order?.deliveryLatitude && window.google) {
            const directionsService = new window.google.maps.DirectionsService();

            // Create LatLng objects for robustness
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
                    } else {
                        console.error(`Directions Error (${status}):`, result);
                        if (status === 'REQUEST_DENIED') {
                            console.warn("DIRECTIONS_API_NOT_ENABLED: Please ensure 'Directions API' is enabled in your Google Cloud Console.");
                        }
                    }
                }
            );
        }
    }, [order?.deliveryLatitude, order?.restaurantLatitude, riderLocation, window.google]);

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <FiClock className="status-svg" />;
            case 'placed': return <FiCheckCircle className="status-svg" />;
            case 'preparing': return <FiShoppingBag className="status-svg" />;
            case 'out_for_delivery': return <FiTruck className="status-svg" />;
            case 'delivered': return <FiCheckCircle className="status-svg" style={{ color: 'var(--success)' }} />;
            default: return <FiInfo className="status-svg" />;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString || Date.now()).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading) return (
        <div className="summary-page-loader">
            <div className="spinner"></div>
            {t("loading_order_details")}
        </div>
    );

    if (!order) return (
        <div className="summary-error">
            <h2>{t("order_not_found")}</h2>
            <Link to="/orders" className="back-link"><FiArrowLeft /> {t("back_to_orders")}</Link>
        </div>
    );

    const content = (
        <div className={`order-summary-modal ${!isModal ? 'page-view' : ''}`} onClick={(e) => e.stopPropagation()}>
            {isModal && (
                <button className="close-summary-btn" onClick={onClose} aria-label="Close">
                    <FiX />
                </button>
            )}

            {!isModal && (
                <div className="page-header-nav">
                    <Link to="/orders" className="back-btn-summary">
                        <FiArrowLeft /> <span>{t("all_orders")}</span>
                    </Link>
                </div>
            )}

            <div className="summary-header">
                <div className="receipt-status-container">
                    <span className={`status-pill status-${(order.status || 'pending').toLowerCase()}`}>
                        {t((order.status || 'pending').toLowerCase())}
                    </span>
                </div>
                <div className="receipt-brand-section">
                    <h2>{order.restaurantName}</h2>
                    <div className="receipt-meta-info">
                        <span className="meta-label">{t("order_receipt")}</span>
                        <span className="meta-divider">•</span>
                        <span className="meta-id">{t("order_id")}: #{order.transaction_id}</span>
                    </div>
                </div>
            </div>

            <div className="summary-body">
                <div className="summary-section">
                    <h3 className="section-title">{t("order_details")} : </h3>
                    <div className="details-grid">
                        <div className="detail-item">
                            <FiCalendar className="detail-icon" />
                            <div>
                                <label>{t("ordered_on")} : </label>
                                <span>{"  " + formatDate(order.createdAt)}</span>
                            </div>
                        </div>
                        <div className="detail-item">
                            <FiMapPin className="detail-icon" />
                            <div>
                                <label>{t("delivery_address")} :  </label>
                                <span>{"  " + order.deliveryAddress}</span>
                            </div>
                        </div>
                        {order.deliveryPartnerName && !['cancelled', 'delivered'].includes(order.status?.toLowerCase()) && (
                            <div className="detail-item">
                                <FiTruck className="detail-icon" />
                                <div>
                                    <label>{t("delivery_partner")} : </label>
                                    <span>{"  " + order.deliveryPartnerName} ({order.deliveryPartnerPhone})</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 🗺️ Live Tracking Map Section */}
                {(order.status === 'OUT_FOR_DELIVERY' || order.status === 'PREPARING') && (
                    <div className="summary-section tracking-map-section">
                        <div className="section-header-with-icon">
                            <FiNavigation className="section-icon pulse-icon" />
                            <h3 className="section-title">{t("live_tracking")}</h3>
                        </div>
                        <div className="map-container-wrapper">
                            <GoogleMap
                                mapContainerClassName="tracking-map"
                                center={riderLocation || (order.deliveryLatitude ? { lat: order.deliveryLatitude, lng: order.deliveryLongitude } : { lat: 20.5937, lng: 78.9629 })}
                                zoom={14}
                                options={{
                                    disableDefaultUI: true,
                                    zoomControl: true,
                                    styles: [
                                        {
                                            "featureType": "all",
                                            "elementType": "geometry",
                                            "stylers": [{ "color": "#1a1c2c" }]
                                        },
                                        {
                                            "featureType": "road",
                                            "elementType": "geometry",
                                            "stylers": [{ "color": "#304a7d" }, { "visibility": "on" }]
                                        },
                                        {
                                            "featureType": "poi",
                                            "elementType": "labels.text.fill",
                                            "stylers": [{ "color": "#d59563" }]
                                        },
                                        {
                                            "featureType": "water",
                                            "elementType": "geometry",
                                            "stylers": [{ "color": "#17263c" }]
                                        }
                                    ]
                                }}
                            >
                                {directions && (
                                    <DirectionsRenderer
                                        directions={directions}
                                        options={{
                                            polylineOptions: {
                                                strokeColor: "#fc8019",
                                                strokeWeight: 5,
                                                strokeOpacity: 0.8
                                            },
                                            suppressMarkers: true
                                        }}
                                    />
                                )}

                                {order.restaurantLatitude && (
                                    <Marker
                                        position={{ lat: order.restaurantLatitude, lng: order.restaurantLongitude }}
                                        title="Restaurant"
                                        icon={{
                                            url: restaurantMarker,
                                            scaledSize: new window.google.maps.Size(40, 40),
                                            origin: new window.google.maps.Point(0, 0),
                                            anchor: new window.google.maps.Point(20, 20)
                                        }}
                                    />
                                )}

                                {order.deliveryLatitude && (
                                    <Marker
                                        position={{ lat: order.deliveryLatitude, lng: order.deliveryLongitude }}
                                        title="Delivery Location"
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
                                            title="Rider Location"
                                            icon={{
                                                url: riderMarker,
                                                scaledSize: new window.google.maps.Size(45, 45),
                                                origin: new window.google.maps.Point(0, 0),
                                                anchor: new window.google.maps.Point(22, 22)
                                            }}
                                        />
                                        <Circle
                                            center={riderLocation}
                                            radius={pulseRadius}
                                            options={{
                                                fillColor: "#fc8019",
                                                fillOpacity: 0.2,
                                                strokeColor: "#fc8019",
                                                strokeOpacity: 0.5,
                                                strokeWeight: 1,
                                                clickable: false
                                            }}
                                        />
                                    </>
                                )}
                            </GoogleMap>
                            <div className="tracking-status-overlay">
                                <div className="tracking-info">
                                    <FiTruck />
                                    <span>{riderLocation ? t("rider_on_way") : t("rider_at_restaurant")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="summary-section">
                    <h3 className="section-title">{t("items_ordered")}</h3>
                    <div className="summary-items-list">
                        {order.items?.map((item, idx) => (
                            <div key={idx} className="summary-item-row">
                                <div className="item-main-info">
                                    {item.imageUrl && <img src={item.imageUrl} alt={item.itemName} className="summary-item-thumb" />}
                                    <div className="item-text">
                                        <span className="summary-item-name">{item.itemName}</span>
                                        <span className="summary-item-qty">{t("items")}: {item.quantity}</span>
                                    </div>
                                </div>
                                <span className="summary-item-price">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="summary-section no-border">
                    <div className="payment-breakdown">
                        <div className="breakdown-row">
                            <span>{t("subtotal")}</span>
                            <span>₹{order.totalAmount}</span>
                        </div>
                        <div className="breakdown-row">
                            <span>{t("delivery_fee")}</span>
                            <span className="free-text">{t("free")}</span>
                        </div>
                        <div className="breakdown-row total-row">
                            <span>{t("amount_paid")}</span>
                            <span>₹{order.totalAmount}</span>
                        </div>
                        <div className="payment-method-tag">
                            {order.paymentMethod === 'COD' ? (
                                <>
                                    <FiHome />
                                    <span>{t("cod")}</span>
                                </>
                            ) : (
                                <>
                                    <FiCreditCard />
                                    <span>{t("online_payment")}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="summary-footer">
                <p>{t("thank_you_msg")}</p>
                {!isModal && (
                    <button className="print-btn" onClick={() => window.print()}>
                        {t("print_receipt")}
                    </button>
                )}
            </div>
        </div>
    );

    if (isModal) {
        return (
            <div className="order-summary-overlay fade-in" onClick={onClose}>
                {content}
            </div>
        );
    }

    return (
        <div className="summary-page-wrapper fade-in">
            <Navbar />
            <div className="summary-page-container">
                {content}
            </div>
        </div>
    );
};

export default OrderSummary;
