import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiX, FiCalendar, FiMapPin, FiTruck, FiCreditCard, FiHome, FiCheckCircle, FiClock, FiShoppingBag, FiInfo, FiArrowLeft, FiNavigation, FiPhone, FiFileText, FiDownload, FiUser, FiRefreshCw, FiHelpCircle, FiChevronDown, FiChevronUp, FiChevronRight } from 'react-icons/fi';
import { GoogleMap, Marker, DirectionsRenderer, Circle } from '@react-google-maps/api';
import { API_BASE_URL } from '../../api/api';
import Navbar from './Navbar';
import restaurantMarker from '../../assets/images/restaurant-marker.png';
import userMarker from '../../assets/images/location-marker.png';
import riderMarker from '../../assets/images/rider-marker.png';
import { useTranslation } from "react-i18next";
import { useCart } from './CartContext';

import '../UserCss/OrderSummary.css';

const OrderSummary = ({ order: propOrder, onClose, isModal = false }) => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [order, setOrder] = useState(propOrder || null);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(!propOrder && !!id);
    const [riderLocation, setRiderLocation] = useState(null);
    const [directions, setDirections] = useState(null);
    const [pulseRadius, setPulseRadius] = useState(50);
    const [showBillDetails, setShowBillDetails] = useState(false);
    const token = localStorage.getItem("token");

    const getArea = (address) => {
        if (!address) return "";
        const parts = address.split(',').map(p => p.trim());
        const skipKeywords = ['floor', 'level', 'unit', 'flat', 'house', 'no.', 'building', 'tower', 'next to', 'opposite'];
        const area = parts.find(p => {
            const lower = p.toLowerCase();
            return !skipKeywords.some(k => lower.includes(k)) && !/^\d+$/.test(p);
        });
        return area || parts[0];
    };

    const isItemVeg = (orderItem) => {
        if (orderItem.type) {
            return orderItem.type.toLowerCase() === 'veg';
        }
        const name = (orderItem.itemName || "").toLowerCase();
        const nonVegKeywords = [
            'chicken', 'mutton', 'fish', 'prawn', 'crab', 'egg', 'kabab', 'kebab', 
            'meat', 'pork', 'beef', 'non-veg', 'non veg', 'tikka', 'butter chicken'
        ];
        const vegOverrides = ['veg', 'mushroom', 'paneer', 'gobi', 'aloo', 'onion', 'cheese', 'dal', 'roti', 'rice'];
        const hasVegOverride = vegOverrides.some(word => name.includes(word));
        if (hasVegOverride) {
            const hasNonVeg = nonVegKeywords.filter(w => w !== 'egg').some(word => name.includes(word));
            if (!hasNonVeg) return true;
        }
        return !nonVegKeywords.some(keyword => name.includes(keyword));
    };

    const renderVegNonVegIcon = (orderItem) => {
        const isVeg = isItemVeg(orderItem);
        return (
            <div className={`veg-nonveg-badge ${isVeg ? 'veg' : 'non-veg'}`}>
                <span className="dot"></span>
            </div>
        );
    };

    const handleReorder = () => {
        if (!order || !order.items) return;
        order.items.forEach(item => {
            addToCart({
                id: item.id || item.itemId,
                name: item.itemName,
                price: item.price,
                available: true
            }, order.restaurantId, item.quantity);
        });
        navigate(`/cart?resId=${order.restaurantId}`);
    };

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

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/restaurants`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRestaurants(res.data);
            } catch (err) {
                console.error("Error fetching restaurants", err);
            }
        };
        if (token) fetchRestaurants();
    }, [token]);

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
                    }
                }
            );
        }
    }, [order?.deliveryLatitude, order?.restaurantLatitude, riderLocation]);

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

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return t('pending') !== 'pending' ? t('pending') : 'Order Pending';
            case 'placed': return t('placed') !== 'placed' ? t('placed') : 'Order Placed';
            case 'paid': return t('paid') !== 'paid' ? t('paid') : 'Order Placed';
            case 'accepted': return t('accepted') !== 'accepted' ? t('accepted') : 'Order Accepted';
            case 'preparing': return t('preparing') !== 'preparing' ? t('preparing') : 'Preparing your food';
            case 'out_for_delivery': return t('out_for_delivery') !== 'out_for_delivery' ? t('out_for_delivery') : 'Out for delivery';
            case 'delivered': return t('delivered') !== 'delivered' ? t('delivered') : 'Order Delivered';
            case 'cancelled': return t('cancelled') !== 'cancelled' ? t('cancelled') : 'Order Cancelled';
            default: return status || 'Order Processing';
        }
    };

    const getEtaText = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
            case 'placed':
            case 'paid':
                return 'Arriving in ~30-35 mins';
            case 'accepted':
            case 'preparing':
                return 'Arriving in ~20-25 mins';
            case 'out_for_delivery':
                return 'Arriving in ~10-15 mins';
            case 'delivered':
                return 'Delivered';
            default:
                return 'Arriving soon';
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
            <button 
                onClick={() => navigate("/orders", { replace: true })} 
                className="back-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <FiArrowLeft /> {t("back_to_orders")}
            </button>
        </div>
    );

    const resInfo = restaurants.find(r => r.id === order.restaurantId);
    const resImage = resInfo ? `${API_BASE_URL}/restaurants/${order.restaurantId}/image` : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400";
    const resAddress = resInfo ? resInfo.address : order.deliveryAddress;

    const itemTotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const taxAmount = order.taxAmount || 0;
    const deliveryFee = order.deliveryFee || 0;
    const discountAmount = order.discountAmount || 0;
    const paidAmount = order.totalAmount || 0;
    const subtotal = itemTotal + taxAmount + deliveryFee;
    const platformFee = Math.max(0, paidAmount + discountAmount - subtotal);
    const grandTotal = itemTotal + taxAmount + deliveryFee + platformFee;
    const savings = discountAmount + (deliveryFee === 0 ? 35 : 0);

    const isActiveOrder = ['placed', 'paid', 'accepted', 'preparing', 'out_for_delivery', 'pending'].includes((order.status || '').toLowerCase());

    const content = isActiveOrder ? (
        /* ======================================================================
           1. ACTIVE ORDER TRACKING VIEW (Matching Image 2 Sketch)
           ====================================================================== */
        <div className={`order-details-wrapper-v4 active-track-wrapper ${!isModal ? 'page-view' : ''}`} onClick={(e) => e.stopPropagation()}>
            {/* Header: Back Arrow | Restaurant Name, Status, Arriving in X min | Support */}
            <div className="active-track-header-v4">
                <button 
                    onClick={() => navigate("/orders", { replace: true })} 
                    className="back-btn-summary-v4"
                    aria-label={t("back_to_orders")}
                >
                    <FiArrowLeft />
                </button>
                <div className="active-header-title-box">
                    <h2 className="header-res-title">{order.restaurantName}</h2>
                    <div className="header-status-sub">{getStatusText(order.status)}</div>
                    <div className="header-eta-badge">
                        <FiClock className="clock-icon" />
                        <span>{getEtaText(order.status)}</span>
                    </div>
                </div>
                <button className="support-action-btn-v4" onClick={() => navigate("/live-chat", { state: { order } })}>
                    <FiInfo /> <span>{t("support") || "support"}</span>
                </button>
            </div>

            <div className="details-scroll-content-v4">
                {/* 1. Maps Section (Image 2 Vector Light Map Style) */}
                <div className="active-track-map-card">
                    <div className="map-container-wrapper-v4">
                        {window.google ? (
                            <GoogleMap
                                mapContainerClassName="tracking-map-v4"
                                center={riderLocation || (order.deliveryLatitude ? { lat: order.deliveryLatitude, lng: order.deliveryLongitude } : { lat: 20.5937, lng: 78.9629 })}
                                zoom={15}
                                options={{
                                    disableDefaultUI: true,
                                    zoomControl: true,
                                    styles: [
                                        { featureType: "water", elementType: "geometry", stylers: [{ color: "#e9e9e9" }, { lightness: 17 }] },
                                        { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f5f5f5" }, { lightness: 20 }] },
                                        { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }, { lightness: 17 }] },
                                        { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#ffffff" }, { lightness: 29 }, { weight: 0.2 }] },
                                        { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#ffffff" }, { lightness: 18 }] },
                                        { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#ffffff" }, { lightness: 16 }] },
                                        { featureType: "poi", elementType: "geometry", stylers: [{ color: "#f5f5f5" }, { lightness: 21 }] },
                                        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#dedede" }, { lightness: 21 }] },
                                        { elementType: "labels.text.stroke", stylers: [{ visibility: "on" }, { color: "#ffffff" }, { lightness: 16 }] },
                                        { elementType: "labels.text.fill", stylers: [{ saturation: 36 }, { color: "#333333" }, { lightness: 40 }] }
                                    ]
                                }}
                            >
                                {directions && (
                                    <DirectionsRenderer
                                        directions={directions}
                                        options={{
                                            polylineOptions: { strokeColor: "#2563eb", strokeWeight: 5, strokeOpacity: 0.9 },
                                            suppressMarkers: true
                                        }}
                                    />
                                )}
                                {order.restaurantLatitude && (
                                    <Marker
                                        position={{ lat: order.restaurantLatitude, lng: order.restaurantLongitude }}
                                        title={order.restaurantName}
                                        icon={{
                                            url: restaurantMarker,
                                            scaledSize: new window.google.maps.Size(40, 40),
                                            origin: new window.google.maps.Point(0, 0),
                                            anchor: new window.google.maps.Point(20, 20)
                                        }}
                                    />
                                )}
                                {order.deliveryLatitude && (
                                    <>
                                        <Marker
                                            position={{ lat: order.deliveryLatitude, lng: order.deliveryLongitude }}
                                            title={t("your_location")}
                                            icon={{
                                                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                                                    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="19" cy="19" r="16" fill="#0f172a" stroke="#ffffff" stroke-width="3"/>
                                                        <path d="M12 21L19 14L26 21V26C26 26.5523 25.5523 27 25 27H13C12.4477 27 12 26.5523 12 26V21Z" fill="white"/>
                                                        <path d="M17 27V22H21V27" stroke="#0f172a" stroke-width="1.5"/>
                                                    </svg>
                                                `),
                                                scaledSize: new window.google.maps.Size(38, 38),
                                                origin: new window.google.maps.Point(0, 0),
                                                anchor: new window.google.maps.Point(19, 19)
                                            }}
                                        />
                                        <Circle
                                            center={{ lat: order.deliveryLatitude, lng: order.deliveryLongitude }}
                                            radius={160}
                                            options={{ fillColor: "#10b981", fillOpacity: 0.15, strokeColor: "#10b981", strokeOpacity: 0.4, strokeWeight: 1, clickable: false }}
                                        />
                                    </>
                                )}
                                {riderLocation && (
                                    <Marker
                                        position={riderLocation}
                                        title={t("delivery_partner")}
                                        icon={{
                                            url: riderMarker,
                                            scaledSize: new window.google.maps.Size(46, 46),
                                            origin: new window.google.maps.Point(0, 0),
                                            anchor: new window.google.maps.Point(23, 23)
                                        }}
                                    />
                                )}
                            </GoogleMap>
                        ) : (
                            /* Fallback Light Map Canvas Matching Image 2 */
                            <div className="fallback-light-map-container">
                                <svg className="light-map-vector-bg" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="400" height="240" fill="#f4f3f0"/>
                                    {/* Grid Roads */}
                                    <path d="M-10 60 L410 60" stroke="#ffffff" strokeWidth="16"/>
                                    <path d="M-10 140 L410 140" stroke="#ffffff" strokeWidth="18"/>
                                    <path d="M80 -10 L80 250" stroke="#ffffff" strokeWidth="14"/>
                                    <path d="M280 -10 L280 250" stroke="#ffffff" strokeWidth="16"/>
                                    <path d="M190 -10 L190 250" stroke="#ffffff" strokeWidth="10"/>
                                    {/* Building Blocks */}
                                    <rect x="90" y="10" width="90" height="40" fill="#e8e6e1" rx="4"/>
                                    <rect x="200" y="10" width="70" height="40" fill="#e8e6e1" rx="4"/>
                                    <rect x="10" y="70" width="60" height="60" fill="#e8e6e1" rx="4"/>
                                    <rect x="90" y="70" width="90" height="60" fill="#e8e6e1" rx="4"/>
                                    <rect x="200" y="70" width="70" height="60" fill="#e8e6e1" rx="4"/>
                                    <rect x="290" y="70" width="100" height="60" fill="#e8e6e1" rx="4"/>
                                    
                                    {/* Translucent Green Neighborhood Area */}
                                    <circle cx="280" cy="170" r="55" fill="#10b981" fillOpacity="0.18" stroke="#10b981" strokeOpacity="0.3"/>
                                    
                                    {/* Blue Route Line matching Image 2 */}
                                    <path d="M115 45 L115 140 L280 140 L280 170" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                                    
                                    {/* Delivery Rider Scooter Icon at top */}
                                    <g transform="translate(93, 20)">
                                        <circle cx="20" cy="20" r="16" fill="#e11d48" stroke="#ffffff" strokeWidth="2"/>
                                        <text x="10" y="26" fontSize="16">🛵</text>
                                    </g>
                                    
                                    {/* Black Circle Home Pin at bottom */}
                                    <g transform="translate(262, 152)">
                                        <circle cx="18" cy="18" r="15" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5"/>
                                        <path d="M12 19L18 13L24 19V23C24 23.55 23.55 24 23 24H13C12.45 24 12 23.55 12 23V19Z" fill="white"/>
                                    </g>

                                    {/* Watermark & Map elements */}
                                    <text x="15" y="225" fill="#94a3b8" fontSize="11" fontWeight="700" fontFamily="sans-serif">Google</text>
                                </svg>
                            </div>
                        )}
                        <div className="tracking-status-overlay-v4">
                            <div className="tracking-info-v4">
                                <FiTruck />
                                <span>{riderLocation ? t("rider_on_way") : t("live_tracking")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Restaurant Details Section */}
                <div className="summary-card-v4 track-res-card">
                    <div className="res-header-row-v4">
                        <img 
                            src={resImage} 
                            alt={order.restaurantName} 
                            className="res-img-v4" 
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400"; }}
                        />
                        <div className="res-name-loc-v4">
                            <h4>{order.restaurantName}</h4>
                            <span>{getArea(resAddress)}</span>
                            <span className="res-status-sub">{getStatusText(order.status)}</span>
                        </div>
                        <a href={`tel:${resInfo?.phnno || '9999999999'}`} className="res-call-btn-v4" title="Call Restaurant">
                            <FiPhone />
                        </a>
                    </div>
                </div>

                {/* 3. Delivery Partner Details Section */}
                <div className="summary-card-v4 track-rider-card">
                    <div className="dp-profile-group">
                        <div className="dp-avatar">
                            {order.deliveryPartnerName ? order.deliveryPartnerName.charAt(0) : <FiTruck />}
                        </div>
                        <div className="dp-main-info">
                            <span className="dp-label">{order.deliveryPartnerName ? t("assigned_partner") : "Delivery Partner"}</span>
                            <span className="dp-name">{order.deliveryPartnerName || "Assigning delivery partner soon..."}</span>
                            <span className="dp-status-text">
                                {order.deliveryPartnerName 
                                    ? (riderLocation ? "On the way to deliver your order" : "Assigned & heading to restaurant")
                                    : "Restaurant is processing your order"
                                }
                            </span>
                        </div>
                        {order.deliveryPartnerName && order.deliveryPartnerPhone && (
                            <a href={`tel:${order.deliveryPartnerPhone}`} className="res-call-btn-v4" title="Call Rider">
                                <FiPhone />
                            </a>
                        )}
                    </div>
                </div>

                {/* 4. Order Details Section */}
                <div className="summary-card-v4 track-order-details-card">
                    <div className="track-section-header">
                        <h3>Order Details</h3>
                    </div>
                    <div className="order-items-list-v4">
                        {order.items?.map((item, idx) => (
                            <div key={idx} className="order-item-row-v4">
                                <div className="item-name-qty-v4">
                                    {renderVegNonVegIcon(item)}
                                    <span>{item.quantity} x {item.itemName}</span>
                                </div>
                                <span className="item-price-val-v4">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                    <div className="divider-v4"></div>
                    <div className="track-paid-summary-row">
                        <span>Total Paid</span>
                        <span className="paid-val">₹{paidAmount.toFixed(2)}</span>
                    </div>
                </div>

                {/* Optional Toggle for Full Bill Summary */}
                <button className="toggle-bill-btn-v4" onClick={() => setShowBillDetails(!showBillDetails)}>
                    <FiFileText />
                    <span>{showBillDetails ? "Hide Bill Details" : "View Full Bill Details"}</span>
                    {showBillDetails ? <FiChevronUp /> : <FiChevronDown />}
                </button>

                {showBillDetails && (
                    <div className="summary-card-v4 bill-summary-card-v4 fade-in">
                        <div className="bill-header-row-v4">
                            <div className="bill-title-left-v4">
                                <FiFileText className="bill-icon-v4" />
                                <h3>Bill Summary</h3>
                            </div>
                            <button className="bill-download-btn-v4" onClick={() => window.print()}>
                                <FiDownload />
                            </button>
                        </div>
                        <div className="bill-rows-v4">
                            <div className="bill-row-item-v4"><span>Item total</span><span>₹{itemTotal.toFixed(2)}</span></div>
                            <div className="bill-row-item-v4"><span>GST & restaurant packaging</span><span>₹{taxAmount.toFixed(2)}</span></div>
                            <div className="bill-row-item-v4"><span>Delivery fee</span>{deliveryFee === 0 ? <span><span className="struck-out">₹35.00</span> <span className="free-text-blue">FREE</span></span> : <span>₹{deliveryFee.toFixed(2)}</span>}</div>
                            {platformFee > 0 && <div className="bill-row-item-v4"><span>Platform fee</span><span>₹{platformFee.toFixed(2)}</span></div>}
                            <div className="divider-v4"></div>
                            <div className="bill-row-item-v4 grand-total-row-v4"><span>Grand total</span><span>₹{grandTotal.toFixed(2)}</span></div>
                            {discountAmount > 0 && <div className="bill-row-item-v4 coupon-row-item-v4"><span>Coupon applied {order.couponCode ? `- ${order.couponCode}` : ''}</span><span>- ₹{discountAmount.toFixed(2)}</span></div>}
                            <div className="bill-row-item-v4 paid-row-item-v4"><span>Paid</span><span>₹{paidAmount.toFixed(2)}</span></div>
                        </div>
                    </div>
                )}

                {/* 5. Help with Order Section & Order ID (Redesigned) */}
                <div className="summary-card-v4 track-help-card-v5">
                    <div className="help-card-main-v5" onClick={() => navigate("/live-chat", { state: { order } })}>
                        <div className="help-icon-badge-v5">
                            <FiHelpCircle />
                        </div>
                        <div className="help-text-box-v5">
                            <h4>Need help with this order?</h4>
                            <span>Chat with support for instant assistance</span>
                        </div>
                        <FiChevronRight className="help-arrow-v5" />
                    </div>
                    <div className="help-card-divider-v5"></div>
                    <div className="help-card-footer-v5">
                        <span className="order-id-title-v5">Order ID</span>
                        <span className="order-id-badge-v5">#{order.id || order.transaction_id}</span>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        /* ======================================================================
           2. COMPLETED ORDER RECEIPT / SUMMARY VIEW
           ====================================================================== */
        <div className={`order-details-wrapper-v4 ${!isModal ? 'page-view' : ''}`} onClick={(e) => e.stopPropagation()}>
            {/* Header Navigation Bar */}
            <div className="details-header-v4">
                <button 
                    onClick={() => navigate("/orders", { replace: true })} 
                    className="back-btn-summary-v4"
                    aria-label={t("back_to_orders")}
                >
                    <FiArrowLeft />
                </button>
                <h2>{t("order_details")}</h2>
                <button className="support-action-btn-v4" onClick={() => navigate("/live-chat", { state: { order } })}>
                    <FiInfo /> <span>{t("support") || "Support"}</span>
                </button>
            </div>

            <div className="details-scroll-content-v4">
                {/* Status Banner */}
                <div className="summary-card-v4 status-banner-card">
                    <div className="status-banner-icon">
                        {getStatusIcon(order.status)}
                    </div>
                    <div className="status-banner-text">
                        <h3>{t("order_was")} {t((order.status || 'pending').toLowerCase())}</h3>
                    </div>
                </div>

                {/* Restaurant & Items */}
                <div className="summary-card-v4 restaurant-card-v4">
                    <div className="res-header-row-v4">
                        <img 
                            src={resImage} 
                            alt={order.restaurantName} 
                            className="res-img-v4" 
                            onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400";
                            }}
                        />
                        <div className="res-name-loc-v4">
                            <h4>{order.restaurantName}</h4>
                            <span>{getArea(resAddress)}</span>
                        </div>
                        <a href={`tel:${resInfo?.phnno || '9999999999'}`} className="res-call-btn-v4">
                            <FiPhone />
                        </a>
                    </div>
                    
                    <div className="divider-v4"></div>
                    
                    <div className="order-meta-row-v4">
                        <span>{t("order_id")}: #{order.id || order.transaction_id}</span>
                    </div>
                    
                    <div className="order-items-list-v4">
                        {order.items?.map((item, idx) => (
                            <div key={idx} className="order-item-row-v4">
                                <div className="item-name-qty-v4">
                                    {renderVegNonVegIcon(item)}
                                    <span>{item.quantity} x {item.itemName}</span>
                                </div>
                                <span className="item-price-val-v4">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bill Summary */}
                <div className="summary-card-v4 bill-summary-card-v4">
                    <div className="bill-header-row-v4">
                        <div className="bill-title-left-v4">
                            <FiFileText className="bill-icon-v4" />
                            <h3>Bill Summary</h3>
                        </div>
                        <button className="bill-download-btn-v4" onClick={() => window.print()}>
                            <FiDownload />
                        </button>
                    </div>
                    
                    <div className="bill-rows-v4">
                        <div className="bill-row-item-v4">
                            <span>Item total</span>
                            <span>₹{itemTotal.toFixed(2)}</span>
                        </div>
                        <div className="bill-row-item-v4">
                            <span>GST & restaurant packaging</span>
                            <span>₹{taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="bill-row-item-v4">
                            <span>Delivery fee</span>
                            {deliveryFee === 0 ? (
                                <span><span className="struck-out">₹35.00</span> <span className="free-text-blue">FREE</span></span>
                            ) : (
                                <span>₹{deliveryFee.toFixed(2)}</span>
                            )}
                        </div>
                        {platformFee > 0 && (
                            <div className="bill-row-item-v4">
                                <span>Platform fee</span>
                                <span>₹{platformFee.toFixed(2)}</span>
                            </div>
                        )}
                        
                        <div className="divider-v4"></div>
                        
                        <div className="bill-row-item-v4 grand-total-row-v4">
                            <span>Grand total</span>
                            <span>₹{grandTotal.toFixed(2)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="bill-row-item-v4 coupon-row-item-v4">
                                <span>Coupon applied {order.couponCode ? `- ${order.couponCode}` : ''}</span>
                                <span>- ₹{discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="bill-row-item-v4 paid-row-item-v4">
                            <span>Paid</span>
                            <span>₹{paidAmount.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    {savings > 0 && (
                        <div className="bill-savings-banner-v4">
                            <span>🥳 You saved ₹{savings.toFixed(2)} on this order!</span>
                        </div>
                    )}
                </div>

                {/* Customer Details & Payment Info */}
                <div className="summary-card-v4 customer-info-card-v4">
                    <div className="info-item-v4">
                        <div className="info-icon-v4 profile">
                            <FiUser />
                        </div>
                        <div className="info-text-v4">
                            <h4>{order.customerName || order.customerEmail?.split('@')[0] || t("customer") || "Customer"}</h4>
                            <span>{order.customerPhone || '9999999999'}</span>
                        </div>
                    </div>
                    
                    <div className="info-item-v4">
                        <div className="info-icon-v4">
                            <FiCreditCard />
                        </div>
                        <div className="info-text-v4">
                            <h4>Payment method</h4>
                            <span>Paid via: {order.paymentMethod || 'UPI'}</span>
                        </div>
                    </div>
                    
                    <div className="info-item-v4">
                        <div className="info-icon-v4">
                            <FiCalendar />
                        </div>
                        <div className="info-text-v4">
                            <h4>Payment date</h4>
                            <span>{formatDate(order.createdAt)}</span>
                        </div>
                    </div>
                    
                    <div className="info-item-v4">
                        <div className="info-icon-v4">
                            <FiMapPin />
                        </div>
                        <div className="info-text-v4">
                            <h4>Delivery address</h4>
                            <span>{order.deliveryAddress}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Footer Action Bar */}
            <div className="details-footer-actions-v4">
                <button className="reorder-action-btn-v4" onClick={handleReorder}>
                    <FiRefreshCw /> {t("reorder")}
                </button>
                <button className="invoice-action-btn-v4" onClick={() => window.print()}>
                    <FiDownload /> {t("invoice") || "Invoice"}
                </button>
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
        <div className={`summary-page-wrapper fade-in ${isActiveOrder ? 'active-track-mode' : ''}`}>
            {content}
        </div>
    );
};

export default OrderSummary;


