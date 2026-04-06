import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import StatusToggle from './StatusToggle';
import OrderCard from './OrderCard';
import BottomNav from './BottomNav';
import Navbar from './Navbar';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import './Dashboard.css';
import { FiTruck, FiShoppingBag, FiMapPin, FiActivity, FiSearch, FiAward, FiZap } from 'react-icons/fi';
import './Achievements.css';

const Dashboard = () => {
    const { user, refreshProfile, updateAvailability, location } = useAuth();
    const [isOnline, setIsOnline] = useState(user?.available || false);
    const [orders, setOrders] = useState([]);
    const [activeOrder, setActiveOrder] = useState(null);
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        if (user) {
            setIsOnline(user.available);
        }
    }, [user?.available]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id || !isOnline) return;
            try {
                const res = await api.get('/delivery-orders/available');
                setOrders(res.data);

                const activeRes = await api.get(`/delivery-orders/partner/${user.id}`);
                const active = activeRes.data.find(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
                setActiveOrder(active);

                await refreshProfile();
            } catch (err) {
                console.error("Dashboard refresh failed", err);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 15000); 
        return () => clearInterval(interval);
    }, [user?.id, isOnline]);

    // Real-time Location Tracking
    useEffect(() => {
        let locationInterval;

        const updateLocation = () => {
            if (!isOnline) return;

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        await api.put(`/partner/auth/location?lat=${latitude}&lng=${longitude}`);
                        console.log("Location updated:", latitude, longitude);
                    } catch (err) {
                        console.error("Failed to update location", err);
                    }
                },
                (err) => console.error("Geolocation error:", err),
                { enableHighAccuracy: true }
            );
        };

        if (isOnline) {
            updateLocation();
            locationInterval = setInterval(updateLocation, 10000); // Update every 10 seconds
        }

        return () => {
            if (locationInterval) clearInterval(locationInterval);
        };
    }, [isOnline]);

    const handleAccept = async (orderId) => {
        try {
            await api.put(`/delivery-orders/${orderId}/accept?partnerId=${user.id}`);
            showToast('Order Accepted! Redirecting...', 'success');
            setTimeout(() => navigate(`/delivery/order/${orderId}`), 1000);
        } catch (err) {
            console.error("Acceptance failed", err);
            showToast('Failed to accept order', 'error');
        }
    };

    const handleReject = (orderId) => {
        setOrders(orders.filter(o => o.id !== orderId));
    };

    const handleToggleStatus = async (e) => {
        const status = e.target.checked;
        try {
            await updateAvailability(status);
            setIsOnline(status);
            if (!status) setOrders([]);
            showToast(`You are now ${status ? 'Online' : 'Offline'}`, 'success');
        } catch (err) {
            console.error("Failed to update status", err);
            showToast('Failed to update status', 'error');
            // Revert state if API fails
            setIsOnline(!status);
        }
    };

    const achievements = [
        { 
            id: 1, name: 'Rookie', 
            icon: <FiTruck />, 
            tier: 'bronze-badge', 
            points: '1+ Order', 
            isUnlocked: user?.totalOrders >= 1 
        },
        { 
            id: 2, name: 'Pro Rider', 
            icon: <FiZap />, 
            tier: 'silver-badge', 
            points: '5+ Orders', 
            isUnlocked: user?.totalOrders >= 5 
        },
        { 
            id: 3, name: '5-Star Hero', 
            icon: <FiAward />, 
            tier: 'gold-badge', 
            points: 'Rating 4.5+', 
            isUnlocked: user?.rating >= 4.5 && user?.totalOrders >= 10 
        },
        { 
            id: 4, name: 'Elite Partner', 
            icon: <FiActivity />, 
            tier: 'gold-badge', 
            points: '50+ Orders', 
            isUnlocked: user?.totalOrders >= 50 
        }
    ];

    return (
        <div className="dashboard-container">
            <Navbar />

            {/* Hero Section */}
            <div className="welcome-section">
                <div className="container">
                    <div className="welcome-text">
                        <small className="text-white-50 text-uppercase fw-bold ls-1">Welcome back,</small>
                        <h4>{user?.name || 'Partner'}</h4>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: '-40px' }}>
                {/* Status Card */}
                <div className="status-card1">
                    <StatusToggle isOnline={isOnline} onToggle={handleToggleStatus} />
                </div>

                {/* Stats Row */}
                <div className="row g-3 stats-container">
                    <div className="col-6">
                        <div className="stat-card1 premium">
                            <div className="stat-icon-circle earnings">
                                <span className="fw-bold">₹</span>
                            </div>
                            <h3 className="stat-value">{user?.totalEarnings || 0}</h3>
                            <span className="stat-label">Earnings</span>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="stat-card1 premium">
                            <div className="stat-icon-circle orders">
                                <FiTruck size={20} />
                            </div>
                            <h3 className="stat-value">{user?.totalOrders || 0}</h3> 
                            <span className="stat-label">Orders</span>
                        </div>
                    </div>
                </div>

                {/* Achievements Section */}
                <div className="section-header mt-4 mb-2 d-flex justify-content-between align-items-center">
                    <h6 className="section-title fw-bold text-dark"><FiAward className="me-2 text-warning" /> My Trophies</h6>
                    <small className="text-primary fw-bold" style={{ cursor: 'pointer' }}>View All</small>
                </div>
                <div className="card-premium p-1 mb-4 shadow-sm border-0 bg-white-50">
                    <div className="achievements-scroll px-2">
                        {achievements.map((a) => (
                            <div key={a.id} className={`badge-card ${!a.isUnlocked ? 'locked' : 'unlocked'}`}>
                                <div className={`badge-icon-wrapper ${a.isUnlocked ? a.tier : 'bg-light border'}`}>
                                    <span className="badge-icon">{a.icon}</span>
                                    {a.isUnlocked && <div className="pulse-glow"></div>}
                                    {!a.isUnlocked && <FiAward className="lock-icon text-muted opacity-50" />}
                                </div>
                                <span className="badge-name">{a.name}</span>
                                <span className="badge-points">{a.points}</span>
                            </div>
                        ))}
                    </div>
                </div>


                {/* Active Order Section */}
                {activeOrder && (
                    <div className="active-order-card1">
                        <div className="active-order-header">
                            <h6 className="mb-0 fw-bold"><i className="fas fa-bolt me-2"></i> Active Order</h6>
                            <div className="d-flex align-items-center">
                                <span className="pulse-dot me-2"></span>
                                <small className="fw-bold">{activeOrder.status}</small>
                            </div>
                        </div>
                        <h5 className="fw-bold mb-1">{activeOrder.restaurantName}</h5>
                        <p className="mb-3 text-white-50"><FiShoppingBag size={14} className="me-1" /> {activeOrder.pickupAddress}</p>
                        <button 
                            className="btn btn-light text-danger fw-bold w-100 rounded-pill shadow-sm"
                            onClick={() => navigate(`/delivery/order/${activeOrder.id}`)}
                        >
                            View Order Details
                        </button>
                    </div>
                )}

                {/* Available Orders Section */}
                <div className="orders-section">
                    <div className="section-header">
                        <h6 className="section-title">
                            {isOnline ? (orders.length > 0 ? 'Available Orders' : 'Searching...') : 'Go Online to see orders'}
                        </h6>
                        {isOnline && orders.length > 0 && <span className="badge bg-primary rounded-pill">{orders.length}</span>}
                    </div>

                    {isOnline ? (
                        orders.length > 0 ? (
                            orders.map(order => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    onAccept={handleAccept}
                                    onReject={handleReject}
                                />
                            ))
                        ) : (
                            <div className="empty-state">
                                <FiSearch size={32} className="mb-2" />
                                <p className="mb-0 fw-medium">Searching for nearby orders...</p>
                                <small className="text-muted">Stay in high demand areas</small>
                            </div>
                        )
                    ) : (
                        <div className="empty-state">
                            <i className="fas fa-moon"></i>
                            <p className="mb-0 fw-medium">You are currently offline</p>
                            <small className="text-muted">Go online to start receiving orders</small>
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default Dashboard;
