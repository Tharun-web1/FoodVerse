import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useToast } from '../../context/ToastContext';
import { useAuth } from './AuthContext';
import api from '../../services/api';
import './OrderDetails.css';
import { GoogleMap, Marker, DirectionsRenderer, Circle } from '@react-google-maps/api';
import GoogleMapsLoader from '../Common/GoogleMapsLoader';
import { FiNavigation, FiMapPin, FiTruck, FiShoppingBag, FiMessageSquare, FiSend, FiCamera, FiCheckCircle } from 'react-icons/fi';
import restaurantMarker from '../../assets/images/restaurant-marker.png';
import userMarker from '../../assets/images/location-marker.png';
import riderMarker from '../../assets/images/rider-marker.png';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { user, location: riderLocation } = useAuth();
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState('ACCEPTED');
    const [directions, setDirections] = useState(null);
    const [pulseRadius, setPulseRadius] = useState(50);
    const [proofImage, setProofImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!id) {
                showToast('Order not found', 'error');
                navigate('/delivery/dash');
                return;
            }
            try {
                const res = await api.get(`/delivery-orders/partner/${user.id}`);
                const foundOrder = res.data.find(o => o.id === parseInt(id));
                if (foundOrder) {
                    setOrder(foundOrder);
                    setStatus(foundOrder.status);
                } else {
                    showToast('Order not found in your assigned tasks', 'error');
                    navigate('/delivery/dash');
                }
            } catch (err) {
                console.error("Error fetching order details", err);
                showToast('Failed to load order details', 'error');
            }
        };

        if (user?.id) fetchOrderDetails();
    }, [id, user?.id, navigate, showToast]);

    const handleStatusUpdate = async () => {
        let nextStatus = '';
        if (status === 'ACCEPTED') nextStatus = 'PICKED_UP';
        else if (status === 'PICKED_UP') {
            if (!proofImage && !order.deliveryPhoto) {
                showToast('Please upload delivery proof (photo) first!', 'warning');
                return;
            }
            nextStatus = 'DELIVERED';
        }
        else return;

        try {
            const res = await api.put(`/delivery-orders/status/${id}?status=${nextStatus}`);
            setOrder(res.data);
            setStatus(res.data.status);
            showToast(`Order marked as ${nextStatus.replace('_', ' ')}`, 'success');
            if (nextStatus === 'DELIVERED') {
                setTimeout(() => navigate('/delivery/dash'), 2000);
            }
        } catch (err) {
            console.error("Status update failed", err);
            showToast('Failed to update status', 'error');
        }
    };

    // 🛣️ Fetch Directions Route (Rider to Next Point)
    useEffect(() => {
        if (order && riderLocation?.lat && window.google) {
            const directionsService = new window.google.maps.DirectionsService();
            const origin = new window.google.maps.LatLng(riderLocation.lat, riderLocation.lng);
            
            let destLat, destLng;
            if (status === 'PICKED_UP') {
                destLat = order.deliveryLatitude;
                destLng = order.deliveryLongitude;
            } else {
                destLat = order.restaurantLatitude;
                destLng = order.restaurantLongitude;
            }

            if (!destLat || !destLng) return;

            const destination = new window.google.maps.LatLng(destLat, destLng);

            directionsService.route(
                {
                    origin: origin,
                    destination: destination,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        setDirections(result);
                    }
                }
            );
        }
    }, [order, riderLocation, status, window.google]);

    // 🏎️ Pulse Animation
    useEffect(() => {
        const pulseInterval = setInterval(() => {
            setPulseRadius(prev => (prev >= 150 ? 50 : prev + 10));
        }, 100);
        return () => clearInterval(pulseInterval);
    }, []);

    const getButtonText = () => {
        switch (status) {
            case 'ACCEPTED': return 'Mark as Picked Up';
            case 'PICKED_UP': return 'Mark as Delivered';
            default: return 'Order Completed';
        }
    };
    const chatTemplates = [
        "I'm at the restaurant.",
        "Stuck in traffic, will be there in 5m.",
        "I've arrived at your location.",
        "Leaving now, see you soon!"
    ];

    const handleSendMessage = (msg) => {
        showToast(`Message Sent: "${msg}"`, 'success');
        // In a real app, this would call a chat API.
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            await api.post(`/delivery-orders/${id}/proof`, formData);
            setProofImage(URL.createObjectURL(file));
            showToast('Delivery proof uploaded successfully!', 'success');
        } catch (err) {
            console.error("Photo upload failed", err);
            showToast('Failed to upload proof', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    if (!order) return <div className="text-center mt-5">Loading...</div>;

    return (
        <div className="order-details-container">
            <Navbar />
            <div className="container content-wrapper mt-5">
                <div className="rider-map-container mb-3 shadow-sm rounded-4 overflow-hidden" style={{ height: '350px', position: 'relative' }}>
                    <GoogleMapsLoader>
                        <GoogleMap
                            mapContainerClassName="w-100 h-100"
                            center={riderLocation?.lat ? { lat: riderLocation.lat, lng: riderLocation.lng } : { lat: 17.3850, lng: 78.4867 }}
                            zoom={13}
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
                                        polylineOptions: { strokeColor: "#fc8019", strokeWeight: 5, strokeOpacity: 0.8 },
                                        suppressMarkers: true
                                    }} 
                                />
                            )}

                            {order?.restaurantLatitude && (
                                <Marker 
                                    position={{ lat: order.restaurantLatitude, lng: order.restaurantLongitude }}
                                    icon={{
                                        url: restaurantMarker,
                                        scaledSize: new window.google.maps.Size(40, 40),
                                        origin: new window.google.maps.Point(0, 0),
                                        anchor: new window.google.maps.Point(20, 20)
                                    }}
                                />
                            )}

                            {order?.deliveryLatitude && (
                                <Marker 
                                    position={{ lat: order.deliveryLatitude, lng: order.deliveryLongitude }}
                                    icon={{
                                        url: userMarker,
                                        scaledSize: new window.google.maps.Size(40, 40),
                                        origin: new window.google.maps.Point(0, 0),
                                        anchor: new window.google.maps.Point(20, 20)
                                    }}
                                />
                            )}

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
                                    <Circle
                                        center={{ lat: riderLocation.lat, lng: riderLocation.lng }}
                                        radius={pulseRadius}
                                        options={{ fillColor: "#fc8019", fillOpacity: 0.2, strokeColor: "#fc8019", strokeOpacity: 0.5, strokeWeight: 1, clickable: false }}
                                    />
                                </>
                            )}
                        </GoogleMap>
                    </GoogleMapsLoader>
                </div>

                <div className="card1 shadow mb-3">
                    <div className="card-body1 p-4">
                        <h5 className="card-title1">Order #{order.id}</h5>
                        <div className="status-stepper mb-4">
                            <div className={`step ${['ACCEPTED', 'PICKED_UP', 'DELIVERED'].includes(status) ? 'active' : ''}`}>Accepted</div>
                            <div className={`step ${['PICKED_UP', 'DELIVERED'].includes(status) ? 'active' : ''}`}>Picked Up</div>
                            <div className={`step ${status === 'DELIVERED' ? 'active' : ''}`}>Delivered</div>
                        </div>

                        <div className="location-info mb-3">
                            <h6 className="text-muted"><i className="fas fa-store me-2"></i>Pickup</h6>
                            <p className="fw-bold mb-1">{order.restaurantName}</p>
                            <small>{order.pickupAddress}</small>
                        </div>
                        <hr />
                        <div className="location-info mb-3">
                            <h6 className="text-muted"><i className="fas fa-home me-2"></i>Dropoff</h6>
                            <p className="fw-bold mb-1">{order.customerName}</p>
                            <small>{order.deliveryAddress}</small>
                            <div className="mt-3">
                                <div className="d-flex gap-2">
                                    <a href={`tel:${order.customerPhone}`} className="btn btn-outline-primary btn-sm rounded-pill flex-grow-1 py-2">
                                        <i className="fas fa-phone me-1"></i> Call
                                    </a>
                                    <button className="btn btn-primary btn-sm rounded-pill flex-grow-1 py-2" onClick={() => handleSendMessage("Hello, I am your delivery partner.")}>
                                        <FiMessageSquare className="me-1" /> Chat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Response Templates */}
                <div className="mb-4">
                    <h6 className="fw-bold mb-3 text-muted small text-uppercase ls-1">Quick Messages</h6>
                    <div className="d-flex flex-wrap gap-2">
                        {chatTemplates.map((template, index) => (
                            <button 
                                key={index} 
                                className="chat-template-chip"
                                onClick={() => handleSendMessage(template)}
                            >
                                {template}
                                <FiSend className="ms-2 small opacity-50" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="card1 shadow mb-4">
                    <div className="card-body1 p-4">
                        <div className="d-flex justify-content-between fw-bold mb-2">
                            <span>Delivery Fee Earned</span>
                            <span className="text-success">+ ₹{order.deliveryFee || 40}</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between text-muted small">
                            <span>Order Value</span>
                            <span>₹{order.orderAmount || order.price}</span>
                        </div>
                    </div>
                </div>

                {/* Proof of Delivery (Photo) Section */}
                {status === 'PICKED_UP' && (
                    <div className="card1 shadow mb-4 proof-section-card animate__animated animate__fadeInUp">
                        <div className="card-body1 p-4">
                            <h6 className="fw-bold mb-3 text-muted small text-uppercase ls-1">Proof of Delivery</h6>
                            <div className="d-flex align-items-center gap-3">
                                <div className="proof-upload-container">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        capture="camera" 
                                        id="proofCamera" 
                                        className="d-none" 
                                        onChange={handlePhotoUpload}
                                    />
                                    <label htmlFor="proofCamera" className={`proof-camera-btn ${proofImage || order.deliveryPhoto ? 'success' : ''}`}>
                                        {isUploading ? <i className="fas fa-circle-notch fa-spin"></i> : (proofImage || order.deliveryPhoto ? <FiCheckCircle /> : <FiCamera />)}
                                    </label>
                                </div>
                                <div className="flex-grow-1">
                                    <p className="mb-0 fw-bold small">{proofImage || order.deliveryPhoto ? 'Proof Captured' : 'Take a photo of the items at the doorstep'}</p>
                                    <small className="text-muted">Required to complete delivery</small>
                                </div>
                                {(proofImage || order.deliveryPhoto) && (
                                    <div className="proof-preview shadow-sm">
                                        <img src={proofImage || `http://localhost:8080/${order.deliveryPhoto.imagePath}`} alt="Proof" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="fixed-bottom p-3 bg-white border-top">
                    <button className="btn btn-primary w-100 py-3 fw-bold shadow-lg" onClick={handleStatusUpdate}>
                        {getButtonText()}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
