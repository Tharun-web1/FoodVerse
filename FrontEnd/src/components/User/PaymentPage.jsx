import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCreditCard, FiSmartphone, FiHome, FiCheckCircle, FiMapPin } from "react-icons/fi";
import { useCart } from "./CartContext";
import axios from "axios";
import { API_BASE_URL } from "../../api/api";
import Navbar from "./Navbar";
import { useToast } from "../../context/ToastContext";
import "../UserCss/PaymentPage.css";
import "../UserCss/SuccessAnimation.css";
import { useTranslation } from "react-i18next";

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { showToast } = useToast();
    const { t } = useTranslation();
    const [paymentMethod, setPaymentMethod] = useState("ONLINE"); 
    const [processing, setProcessing] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        // Load Razorpay Script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        if (location.state && location.state.orderData) {
            setOrderData(location.state.orderData);
        } else {
            navigate("/cart");
        }

        return () => {
            document.body.removeChild(script);
        };
    }, [location.state, navigate]);

    const handlePayment = async () => {
        setProcessing(true);
        const token = localStorage.getItem("token");

        try {
            // 1. Create Order in Backend
            const orderPayload = {
                restaurantId: orderData.restaurantId,
                addressId: orderData.addressId,
                paymentMethod: paymentMethod === "COD" ? "COD" : "ONLINE",
                items: orderData.items.map(item => ({
                    itemId: item.itemId,
                    qty: item.qty
                })),
                deliveryFee: orderData.deliveryFee || 0,
                taxAmount: orderData.taxes || 0,
                deliveryAddress: orderData.manualAddress || null,
                latitude: orderData.latitude,
                longitude: orderData.longitude,
                couponCode: orderData.couponCode,
                discountAmount: orderData.discountAmount
            };

            const response = await axios.post(`${API_BASE_URL}/orders/place`, orderPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const orderResponse = response.data;

            // 2. Handle Online Payment with Razorpay
            if (paymentMethod !== "COD") {
                const options = {
                    key: "rzp_test_SHxVDW9HWqLy3b", //key ID
                    amount: (orderData.totalAmount * 100).toString(),
                    currency: "INR",
                    name: "Food App",
                    description: "Order Payment",
                    order_id: orderResponse.razorpayOrderId,
                    handler: async function (response) {
                        try {
                            // 3. Verify Payment
                            const verifyPayload = {
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature
                            };

                            await axios.post(`${API_BASE_URL}/orders/verify`, verifyPayload, {
                                headers: { Authorization: `Bearer ${token}` }
                            });

                            clearCart();
                            setShowSuccess(true);
                        } catch (err) {
                            console.error("Verification failed", err);
                            showToast("Payment verification failed. Please contact support.", "error");
                        }
                    },
                    prefill: {
                        name: orderResponse.customerName || "",
                        email: orderResponse.customerEmail || "",
                        contact: orderResponse.customerPhone || ""
                    },
                    theme: {
                        color: "#fc8019"
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                // 4. Handle COD Success
                clearCart();
                setShowSuccess(true);
            }
        } catch (err) {
            console.error("Payment error:", err);
            showToast("Failed to initiate order. Please try again.", "error");
        } finally {
            setProcessing(false);
        }
    };

    const SuccessModal = () => (
        <div className="order-success-modal">
            <ConfettiEffect />
            <div className="success-modal-content">
                <div className="success-icon-wrapper">
                    <FiCheckCircle />
                </div>
                <h2>{t("order_placed_title")}</h2>
                <p>{t("order_placed_msg")}</p>
                <button className="success-close-btn" onClick={() => navigate("/orders")}>
                    {t("view_my_orders")}
                </button>
            </div>
        </div>
    );

    const ConfettiEffect = () => {
        const colors = ['#fc8019', '#1ba672', '#2f3134', '#ff4d4d', '#ffba00'];
        return (
            <div className="confetti-container">
                {[...Array(50)].map((_, i) => (
                    <div 
                        key={i} 
                        className="confetti-piece"
                        style={{
                            left: `${Math.random() * 100}%`,
                            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                            animationDelay: `${Math.random() * 3}s`,
                            transform: `rotate(${Math.random() * 360}deg)`
                        }}
                    />
                ))}
            </div>
        );
    };

    if (!orderData) return null;

    return (
        <div className="payment-page">
            {showSuccess && <SuccessModal />}
            <Navbar />

            <div className="payment-container">
                <div className="payment-header">
                    <button className="back-btn" onClick={() => navigate("/cart")}>
                        <FiArrowLeft />
                    </button>
                    <h1>Payment Methods</h1>
                </div>

                <div className="payment-content">
                    <div className="payment-left-col">
                        {/* Delivery Address Summary */}
                        <div className="delivery-summary-card">
                            <div className="summary-header">
                                <FiMapPin className="pin-icon" />
                                <h2 className="section-title">Delivery Address</h2>
                            </div>
                            <div className="address-display">
                                <p>{orderData.displayAddress || "Saved Address"}</p>
                            </div>
                        </div>

                        {/* Payment Options */}
                        <div className="payment-options">
                            <h2 className="section-title">Select Payment Method</h2>

                            <div
                                className={`payment-card ${paymentMethod === "ONLINE" ? "selected" : ""}`}
                                onClick={() => setPaymentMethod("ONLINE")}
                            >
                                <div className="card-icon">
                                    <FiCreditCard />
                                </div>
                                <div className="card-info">
                                    <h3>Online Payment</h3>
                                    <p>Pay securely via Razorpay (UPI, Card, NetBanking)</p>
                                </div>
                                <div className="selection-indicator">
                                    {paymentMethod === "ONLINE" && <FiCheckCircle />}
                                </div>
                            </div>

                            <div
                                className={`payment-card ${paymentMethod === "COD" ? "selected" : ""}`}
                                onClick={() => setPaymentMethod("COD")}
                            >
                                <div className="card-icon">
                                    <FiHome />
                                </div>
                                <div className="card-info">
                                    <h3>Cash on Delivery</h3>
                                    <p>Pay when you receive the order</p>
                                </div>
                                <div className="selection-indicator">
                                    {paymentMethod === "COD" && <FiCheckCircle />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="payment-summary">
                        <div className="summary-card">
                            <h2 className="section-title">Order Summary</h2>
                            <div className="summary-details">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>₹{orderData.subtotal}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Delivery Fee</span>
                                    <span>₹{orderData.deliveryFee}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Taxes & Charges</span>
                                    <span>₹{orderData.taxes}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total Amount</span>
                                    <span>₹{orderData.totalAmount}</span>
                                </div>
                            </div>

                            <button
                                className="pay-btn"
                                onClick={handlePayment}
                                disabled={processing}
                            >
                                {processing ? "Processing..." : `Pay ₹${orderData.totalAmount}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
