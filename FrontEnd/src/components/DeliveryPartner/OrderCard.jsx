import { FiShoppingBag, FiMapPin } from 'react-icons/fi';

import './OrderCard.css';

const OrderCard = ({ order, onAccept, onReject }) => {
    return (
        <div className="card1 order-card1 mb-3 shadow-sm">
            <div className="card-body1">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title1 mb-0 text-primary">₹{order.price}</h5>
                    <span className="badge bg-info text-dark">New Order</span>
                </div>

                <div className="order-route">
                    <div className="route-point">
                        <FiShoppingBag size={18} className="me-2 text-primary" />
                        <span>{order.restaurantName}</span>
                        <small className="d-block text-muted ms-4">{order.pickupAddress}</small>
                    </div>
                    <div className="route-line"></div>
                    <div className="route-point mt-2">
                        <FiMapPin size={18} className="me-2 text-danger" />
                        <span>Customer Location</span>
                        <small className="d-block text-muted ms-4">{order.deliveryAddress}</small>
                    </div>
                </div>

                <div className="d-flex gap-3 mt-4">
                    <button className="btn btn-reject flex-grow-1" onClick={() => onReject(order.id)}>Reject</button>
                    <button className="btn btn-accept flex-grow-1 shadow-sm" onClick={() => onAccept(order.id)}>Accept Order</button>
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
