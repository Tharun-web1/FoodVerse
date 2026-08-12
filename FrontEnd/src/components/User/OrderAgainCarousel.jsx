import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiRotateCcw, FiShoppingBag, FiChevronRight } from 'react-icons/fi';
import { API_BASE_URL } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from './CartContext';
import { useToast } from '../../context/ToastContext';
import '../UserCss/OrderAgainCarousel.css';

const OrderAgainCarousel = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const { addToCart } = useCart();
    const { showToast } = useToast();

    const [reorderItems, setReorderItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        const fetchPastOrders = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const orders = res.data || [];
                
                // Extract items from completed/delivered orders
                const itemsList = [];
                orders.forEach(ord => {
                    if (ord.items && Array.isArray(ord.items)) {
                        ord.items.forEach(item => {
                            itemsList.push({
                                orderId: ord.id || ord.transaction_id,
                                restaurantId: ord.restaurantId || item.restaurantId,
                                restaurantName: ord.restaurantName || 'Bitezy Special',
                                dishName: item.itemName || item.name || 'Delicious Dish',
                                price: item.price || 199,
                                imageUrl: item.imageUrl || ord.restaurantImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
                                date: ord.createdAt ? new Date(ord.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent',
                                originalItem: item
                            });
                        });
                    }
                });

                // Deduplicate by dish name
                const uniqueMap = new Map();
                itemsList.forEach(i => {
                    if (!uniqueMap.has(i.dishName)) {
                        uniqueMap.set(i.dishName, i);
                    }
                });

                setReorderItems(Array.from(uniqueMap.values()).slice(0, 6));
            } catch (err) {
                console.error("Error fetching order again carousel items:", err);
                // Fallback demo items
                setReorderItems([
                    { orderId: 1, restaurantId: 101, restaurantName: 'Spice Garden', dishName: 'Paneer Butter Masala', price: 240, date: 'Yesterday', imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300' },
                    { orderId: 2, restaurantId: 102, restaurantName: 'Pizza Castle', dishName: 'Cheesy Pepperoni Pizza', price: 349, date: '3 days ago', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300' },
                    { orderId: 3, restaurantId: 103, restaurantName: 'Biryani Hub', dishName: 'Hyderabadi Chicken Biryani', price: 299, date: 'Last week', imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300' }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchPastOrders();
    }, [token]);

    if (loading || reorderItems.length === 0) return null;

    const handleReorder = (item) => {
        addToCart({
            id: item.originalItem?.id || item.originalItem?.itemId || Date.now(),
            name: item.dishName,
            price: item.price,
            available: true,
            imageUrl: item.imageUrl
        }, item.restaurantId, 1);

        showToast(`Added ${item.dishName} to your cart!`, "success");
        navigate('/cart');
    };

    return (
        <div className="order-again-section">
            <div className="order-again-header">
                <h3>
                    <FiRotateCcw style={{ color: '#e11d48' }} /> Order Again
                </h3>
                <span className="title-badge">{reorderItems.length} Favorites</span>
            </div>

            <div className="order-again-scroll-container">
                {reorderItems.map((item, idx) => (
                    <div key={idx} className="order-again-card" onClick={() => handleReorder(item)}>
                        <div className="oa-thumb-box">
                            <img src={item.imageUrl} alt={item.dishName} />
                            <span className="oa-date-tag">{item.date}</span>
                        </div>
                        <div className="oa-card-info">
                            <h4 className="oa-dish-name">{item.dishName}</h4>
                            <p className="oa-res-name">{item.restaurantName}</p>
                        </div>
                        <div className="oa-card-footer">
                            <span className="oa-price">₹{item.price}</span>
                            <button className="oa-reorder-btn" onClick={(e) => { e.stopPropagation(); handleReorder(item); }}>
                                <FiShoppingBag /> Add
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderAgainCarousel;
