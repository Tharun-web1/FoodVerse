import "../RestaurantCss/OrderCard.css";
import "../RestaurantCss/KOTStyles.css";
import React, { useState } from 'react';

export default function OrderTable({ orders, updateStatus, showActions = true }) {
    const [selectedOrderForPrep, setSelectedOrderForPrep] = useState(null);
    const [prepTimeValue, setPrepTimeValue] = useState(20); // Default minutes

    const handleAcceptWithPrep = (orderId) => {
        setSelectedOrderForPrep(orderId);
    };

    const confirmAccept = () => {
        updateStatus(selectedOrderForPrep, "ACCEPTED", prepTimeValue);
        setSelectedOrderForPrep(null);
    };

    if (!orders || orders.length === 0) {
        return (
            <div className="text-center mt-5 py-5 border rounded-4 bg-white shadow-sm">
                <i className="bi bi-cart-x text-muted" style={{ fontSize: "3rem", color: "#94a3b8 !important" }}></i>
                <h5 className="mt-3 fw-bold" style={{ color: "#1e293b" }}>No orders found</h5>
                <p className="text-muted small">New orders matching this status will appear here.</p>
            </div>
        );
    }

    const handlePrintKOT = (order) => {
        console.log("Printing KOT for order:", order.id, order.items);
        const kotContent = `
            <div id="kot-printable">
                <div class="kot-header">
                    <h2>KITCHEN ORDER TICKET</h2>
                    <p>Order ID: <strong>#${order.id}</strong></p>
                    <p>Time: ${new Date(order.createdAt || Date.now()).toLocaleString()}</p>
                </div>
                <div class="kot-order-info">
                    <span>Customer: ${order.customerName}</span>
                    <span>Status: ${order.status}</span>
                </div>
                <table class="kot-items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th style="text-align: right;">Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(order.items || []).map(item => `
                            <tr>
                                <td>${item.itemName}</td>
                                <td style="text-align: right;">${item.quantity}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="kot-footer">
                    <p>--- End of KOT ---</p>
                </div>
            </div>
        `;

        // Create temporary element, print, then remove
        const printLayer = document.createElement('div');
        printLayer.innerHTML = kotContent;
        document.body.appendChild(printLayer);
        window.print();
        document.body.removeChild(printLayer);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "PLACED":
            case "PAID": return "status-new";
            case "ACCEPTED": return "status-accepted";
            case "PREPARING": return "status-preparing";
            case "OUT_FOR_DELIVERY": return "status-delivery";
            case "DELIVERED": return "status-delivered";
            case "CANCELLED":
            case "CANCELED":
            case "REJECTED": return "status-cancelled";
            default: return "";
        }
    };

    return (
        <div className="orders-wrapper">
            {/* Desktop Table View */}
            <div className="desktop-only-view table-responsive">
                <table className="table premium-table">
                    <thead>
                        <tr>
                            <th>ORDER</th>
                            <th>CUSTOMER</th>
                            <th>ITEMS</th>
                            <th className="text-end">TOTAL</th>
                            <th className="text-center">STATUS</th>
                            {showActions && <th className="text-end">ACTIONS</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="order-id-badge">#{order.id}</td>
                                <td className="order-customer-info">
                                    <div className="d-flex flex-column">
                                        <span className="customer-name">{order.customerName}</span>
                                        <small className="text-muted">{order.customerPhone}</small>
                                    </div>
                                </td>
                                <td>
                                    <ul className="order-items-list list-unstyled mb-0 small">
                                        {order.items?.map((item) => (
                                            <li key={item.id}>
                                                {item.itemName} <span className="item-qty">x{item.quantity}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td className="text-end fw-bold order-total-amount">₹{order.totalAmount}</td>
                                <td className="text-center">
                                    <div className="d-flex flex-column align-items-center">
                                        <span className={`status-badge-premium ${getStatusClass(order.status)}`}>
                                            {order.status === "OUT_FOR_DELIVERY" ? "OUT FOR DELIVERY" : order.status}
                                        </span>
                                        {order.estimatedPrepTime && (
                                            <small className="mt-1 fw-bold" style={{ color: "#64748b" }}>🕒 {order.estimatedPrepTime}m</small>
                                        )}
                                    </div>
                                </td>
                                {showActions && (
                                    <td className="text-end">
                                        <div className="d-flex justify-content-end gap-2">
                                            {(order.status === "PLACED" || order.status === "PAID") && (
                                                <>
                                                    <button className="btn btn-sm btn-success rounded-pill px-3" onClick={() => handleAcceptWithPrep(order.id)}>Accept</button>
                                                    <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => updateStatus(order.id, "CANCELLED")}>Reject</button>
                                                </>
                                            )}
                                            {order.status === "ACCEPTED" && (
                                                <>
                                                    <button className="btn btn-sm btn-warning rounded-pill px-3" onClick={() => updateStatus(order.id, "PREPARING")}>Prepare</button>
                                                    <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => updateStatus(order.id, "CANCELLED")}>Reject</button>
                                                </>
                                            )}
                                            {order.status === "PREPARING" && <span className="text-muted small">Cooking...</span>}
                                            {order.status === "OUT_FOR_DELIVERY" && <span className="text-muted small">In Route</span>}
                                            {(order.status === "DELIVERED" || order.status.includes("CANCEL")) && <span className="text-muted small">Finalized</span>}
                                            <button 
                                                className="btn btn-sm btn-outline-secondary rounded-pill px-3" 
                                                onClick={() => handlePrintKOT(order)}
                                                title="Print Kitchen Ticket"
                                            >
                                                <i className="bi bi-printer"></i> KOT
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="mobile-only-view order-cards-mobile">
                {orders.map((order) => (
                    <div key={order.id} className="order-card-premium">
                        <div className="order-card-header">
                            <div>
                                <span className="order-id-badge">#{order.id}</span>
                                <div className="mt-1">
                                    <span className="customer-name-mobile">{order.customerName}</span>
                                    <span className="customer-phone-mobile">{order.customerPhone}</span>
                                </div>
                            </div>
                            <div className="d-flex flex-column align-items-end">
                                <span className={`status-badge-premium ${getStatusClass(order.status)}`}>
                                    {order.status === "OUT_FOR_DELIVERY" ? "ON WAY" : order.status}
                                </span>
                                {order.estimatedPrepTime && (
                                    <small className="mt-1 fw-bold" style={{ color: "#64748b" }}>🕒 {order.estimatedPrepTime}m</small>
                                )}
                            </div>
                        </div>

                        <div className="order-card-body">
                            <ul className="order-items-list-mobile">
                                {order.items?.map((item) => (
                                    <li key={item.id} className="order-item-mobile">
                                        <span>{item.itemName}</span>
                                        <span className="order-item-qty">x{item.quantity}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="order-total-mobile">
                                <span>TotalBill</span>
                                <span>₹{order.totalAmount}</span>
                            </div>
                        </div>

                        {showActions && (
                            <div className="order-card-actions-mobile">
                                {(order.status === "PLACED" || order.status === "PAID") && (
                                    <>
                                        <button className="btn btn-success py-3 rounded-4 fw-bold" onClick={() => handleAcceptWithPrep(order.id)}>Accept Order</button>
                                        <button className="btn btn-outline-danger py-3 rounded-4 fw-bold" onClick={() => updateStatus(order.id, "CANCELLED")}>Reject</button>
                                    </>
                                )}
                                {order.status === "ACCEPTED" && (
                                    <>
                                        <button className="btn btn-warning py-3 rounded-4 fw-bold" onClick={() => updateStatus(order.id, "PREPARING")}>Start Cooking</button>
                                        <button className="btn btn-outline-secondary py-3 rounded-4 fw-bold" onClick={() => handlePrintKOT(order)}>Print KOT</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Prep Time Modal Selection */}
            {selectedOrderForPrep && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                            <div className="modal-body p-4 text-center">
                                <div className="mb-3">
                                    <h4 className="fw-bold">Estimate Prep Time</h4>
                                    <p className="text-muted">How many minutes will this order take?</p>
                                </div>

                                <div className="d-grid gap-3 mb-4">
                                    <div className="d-flex justify-content-center gap-2 mb-2">
                                        {[10, 20, 30, 45].map(time => (
                                            <button 
                                                key={time} 
                                                className={`btn rounded-pill px-3 ${prepTimeValue === time ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => setPrepTimeValue(time)}
                                            >
                                                {time}m
                                            </button>
                                        ))}
                                    </div>
                                    <input 
                                        type="number" 
                                        className="form-control form-control-lg text-center rounded-3 bg-light border-0" 
                                        placeholder="Custom Minutes"
                                        value={prepTimeValue}
                                        onChange={(e) => setPrepTimeValue(parseInt(e.target.value) || 0)}
                                    />
                                </div>

                                <div className="d-flex gap-3">
                                    <button className="btn btn-light py-3 rounded-3 flex-grow-1 fw-bold" onClick={() => setSelectedOrderForPrep(null)}>Cancel</button>
                                    <button className="btn btn-primary py-3 rounded-3 flex-grow-1 fw-bold" onClick={confirmAccept}>Accept Order</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
