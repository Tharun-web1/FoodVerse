import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import { useAuth } from './AuthContext';
import api from '../../services/api';

const OrderHistory = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user?.id) return;
            try {
                const res = await api.get(`/delivery-orders/partner/${user.id}`);
                setHistory(res.data.reverse());
            } catch (err) {
                console.error("Failed to fetch history", err);
            }
        };
        fetchHistory();
    }, [user?.id]);

    return (
        <div className="bg-light min-vh-100 pb-5">
            <Navbar />
            <div className="container" style={{ paddingTop: '80px' }}>
                <h4 className="mb-4">Order History</h4>
                <div className="list-group border-0">
                    {history.length > 0 ? history.map(order => (
                        <div key={order.id} className="card1 list-group-item list-group-item-action border-0 d-flex flex-row justify-content-between align-items-center mb-3 p-3">
                            <div>
                                <h6 className="mb-1">{order.restaurantName}</h6>
                                <small className="text-muted">Order #{order.orderId} • {new Date(order.assignedTime).toLocaleDateString()}</small>
                            </div>
                            <div className="text-end">
                                <span className={`badge ${order.status === 'DELIVERED' ? 'bg-success' : 'bg-danger'} mb-1`}>
                                    {order.status}
                                </span>
                                <div className="fw-bold">₹{order.orderAmount}</div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-muted mt-5 py-5">
                            <i className="fas fa-history fa-3x mb-3 text-light"></i>
                            <p>No past orders found.</p>
                        </div>
                    )}
                </div>
            </div>
            <BottomNav />
        </div>
    );
};

export default OrderHistory;
