import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import Navbar from "../User/Navbar";
import EmptyCartImg from "../../assets/images/empty-cart.png";
import "../UserCss/Cart.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../api/api";
import Address from "./Address"
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";

const Cart = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { cartItems, restaurantId, addToCart, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();
    const [ordering, setOrdering] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [restaurant, setRestaurant] = useState(null);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [isManualAddress, setIsManualAddress] = useState(false);
    
    // Coupon State
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState("");
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [manualAddressData, setManualAddressData] = useState({
        addressLine: "",
        city: "",
        state: "",
        zipCode: ""
    });
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token) {
            axios.get(`${API_BASE_URL}/users/addresses`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                setAddresses(res.data);
                const defaultAddr = res.data.find(a => a.default);
                if (defaultAddr) setSelectedAddressId(defaultAddr.id);
                else if (res.data.length > 0) setSelectedAddressId(res.data[0].id);
            }).catch(err => console.error("Error fetching addresses", err));
        }

        if (restaurantId) {
            axios.get(`${API_BASE_URL}/restaurants/${restaurantId}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                setRestaurant(res.data);
            }).catch(err => console.error("Error fetching restaurant", err));
        } else {
            setRestaurant(null);
        }
    }, [token, restaurantId]);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
        const R = 6371; 
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; 
    };

    useEffect(() => {
        const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
        if (subtotal === 0) {
            setDeliveryFee(0);
            return;
        }

        if (restaurant && (selectedAddressId || isManualAddress)) {
            const addr = isManualAddress ? manualAddressData : addresses.find(a => a.id === selectedAddressId);
            if (addr && addr.latitude && addr.longitude) {
                const dist = calculateDistance(
                    parseFloat(restaurant.r_lat), 
                    parseFloat(restaurant.r_lon), 
                    parseFloat(addr.latitude), 
                    parseFloat(addr.longitude)
                );
                // 15 per km, minimum 20
                const fee = Math.max(20, Math.round(dist * 15));
                setDeliveryFee(fee);
            } else {
                setDeliveryFee(40); // Fallback
            }
        } else {
            setDeliveryFee(40); // Default/Fallback
        }
    }, [restaurant, selectedAddressId, isManualAddress, manualAddressData, addresses, cartItems]);

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const taxes = Math.round(subtotal * 0.05); // 5% tax
    const total = subtotal + deliveryFee + taxes - (appliedCoupon?.discountAmount || 0);

    useEffect(() => {
        if (subtotal > 0 && token) {
            axios.get(`${API_BASE_URL}/orders/available-coupons?total=${subtotal}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                setAvailableCoupons(res.data);
            }).catch(err => console.error("Error fetching coupons", err));
        } else {
            setAvailableCoupons([]);
        }
    }, [subtotal, token]);


    const handleApplyCoupon = async (codeOverride = null) => {
        const code = (typeof codeOverride === 'string' ? codeOverride : couponInput).trim();
        if (!code) return;
        setCouponError("");
        try {
            const response = await axios.post(`${API_BASE_URL}/orders/validate-coupon?code=${code}&total=${subtotal}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setAppliedCoupon(response.data);
            if (typeof showToast !== 'undefined') {
                showToast(t("coupon_applied"), "success");
            } else {
                alert(t("coupon_applied"));
            }
        } catch (err) {
            setAppliedCoupon(null);
            const msg = err.response?.data?.message || t("invalid_coupon");
            setCouponError(msg);
            if (typeof showToast !== 'undefined') {
                showToast(msg, "error");
            } else {
                alert(msg);
            }
        }
    };

    const handleCheckout = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            showToast(t("login_to_order"), "warning");
            return;
        }

        if (!restaurantId && cartItems.length > 0) {
            showToast(t("restaurant_info_missing"), "error");
            return;
        }

        if (!isManualAddress && !selectedAddressId) {
            showToast(t("select_address_msg"), "info");
            return;
        }

        if (isManualAddress && (!manualAddressData.addressLine.trim() || !manualAddressData.city.trim() || !manualAddressData.zipCode.trim())) {
            showToast(t("fill_address_details"), "warning");
            return;
        }

        const manualAddressStr = isManualAddress
            ? `${manualAddressData.addressLine}, ${manualAddressData.city}, ${manualAddressData.state} ${manualAddressData.zipCode}`.trim()
            : null;

        const selectedAddrObj = addresses.find(a => a.id === selectedAddressId);
        const displayAddress = isManualAddress
            ? manualAddressStr
            : (selectedAddrObj ? `${selectedAddrObj.addressLine}, ${selectedAddrObj.city}, ${selectedAddrObj.state} ${selectedAddrObj.zipCode}` : t("saved_address"));

        // Instead of placing order, redirect to payment page
        const orderData = {
            restaurantId: parseInt(restaurantId),
            addressId: isManualAddress ? null : selectedAddressId,
            manualAddress: manualAddressStr,
            displayAddress,
            latitude: isManualAddress ? manualAddressData.latitude : selectedAddrObj?.latitude,
            longitude: isManualAddress ? manualAddressData.longitude : selectedAddrObj?.longitude,
            items: cartItems.map(item => ({
                itemId: item.itemId,
                qty: item.qty,
                itemName: item.itemName, // For display on payment page
                price: item.price
            })),
            totalAmount: total,
            subtotal,
            deliveryFee,
            taxes,
            couponCode: appliedCoupon?.code || null,
            discountAmount: appliedCoupon?.discountAmount || 0
        };

        navigate("/payment", { state: { orderData } });
    };

    if (cartItems.length === 0) {
        return (
            <>
                <Navbar />
                <div className="cart-page-container">
                    <div className="empty-cart-container">
                        <img
                            src={EmptyCartImg}
                            alt={t("empty_cart")}
                            className="empty-cart-img"
                        />
                        <h2>{t("empty_cart")}</h2>
                        <p>{t("empty_cart_msg")}</p>
                        <button className="browse-rest-btn" onClick={() => navigate("/user")}>
                            {t("see_restaurants")}
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="cart-page-container">
                <h1 className="cart-title">{t("cart_title")}</h1>

                <div className="cart-content-layout">
                    {/* LEFT: Items List */}
                    <div className="cart-items-section">
                        {cartItems.map((item) => (
                            <div key={item.id} className="cart-item-card">
                                <div className="cart-item-info">
                                    <h3 className="cart-item-name">{item.itemName}</h3>
                                    <p className="cart-item-price">₹{item.price}</p>
                                </div>
                                <div className="cart-item-controls">
                                    <div className="cart-qty-toggle">
                                        <button onClick={() => removeFromCart(item.itemId)}>-</button>
                                        <span>{item.qty}</span>
                                        <button onClick={() => addToCart({ id: item.itemId, itemName: item.itemName, price: item.price }, restaurantId)}>+</button>
                                    </div>
                                    <p className="cart-item-subtotal">₹{item.price * item.qty}</p>
                                </div>
                            </div>
                        ))}

                        {/* Address Selection */}
                        <div className="address-selection-section">
                            <h2 className="section-title">{t("delivery_address")}</h2>

                            <div className="address-tabs">
                                <button
                                    className={`address-tab ${!isManualAddress ? 'active' : ''}`}
                                    onClick={() => setIsManualAddress(false)}
                                >
                                    {t("saved_addresses")}
                                </button>
                                <button
                                    className={`address-tab ${isManualAddress ? 'active' : ''}`}
                                    onClick={() => setIsManualAddress(true)}
                                >
                                    {t("enter_manually")}
                                </button>
                            </div>

                            {!isManualAddress ? (
                                addresses.length === 0 ? (
                                    <div className="no-address-msg">
                                        <p>{t("no_address_found")} <button onClick={() => navigate("/profile")}>{t("add_address")}</button></p>
                                    </div>
                                ) : (
                                    <div className="address-options">
                                        {addresses.map(addr => (
                                            <div
                                                key={addr.id}
                                                className={`address-option-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedAddressId(addr.id)}
                                            >
                                                <div className="addr-type">{addr.addressType}</div>
                                                <p className="addr-text">{addr.addressLine.substring(0, 40)}...</p>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <Address
                                    formData={manualAddressData}
                                    setFormData={setManualAddressData}
                                />
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Bill Summary */}
                    <div className="cart-summary-section">
                        <h2 className="summary-title">{t("bill_details")}</h2>
                        <div className="summary-row">
                            <span>{t("item_total")}</span>
                            <span>₹{subtotal}</span>
                        </div>

                        {/* Apply Coupon UI */}
                        <div className="apply-coupon-container">
                            <div className="coupon-input-group">
                                <input 
                                    type="text" 
                                    placeholder={t("enter_coupon")} 
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                    className="coupon-field"
                                    disabled={appliedCoupon}
                                />
                                {appliedCoupon ? (
                                    <button className="coupon-action-btn remove" onClick={() => { setAppliedCoupon(null); setCouponInput(""); }}>{t("remove")}</button>
                                ) : (
                                    <button className="coupon-action-btn apply" onClick={handleApplyCoupon}>{t("apply")}</button>
                                )}
                            </div>
                            {couponError && <p className="coupon-err-msg">{couponError}</p>}
                            {appliedCoupon && <p className="coupon-ok-msg">{t("coupon_applied_msg", { code: appliedCoupon.code })}</p>}

                            {/* Available Coupons */}
                            {availableCoupons.length > 0 && !appliedCoupon && (
                                <div className="available-coupons-section">
                                    <p className="available-coupons-title">{t("available_coupons")}</p>
                                    <div className="coupons-list">
                                        {availableCoupons.map(cp => (
                                            <div key={cp.code} className="coupon-item" onClick={() => handleApplyCoupon(cp.code)}>
                                                <div className="coupon-code-badge">{cp.code}</div>
                                                <div className="coupon-desc">{cp.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {appliedCoupon && (
                            <div className="summary-row discount-row-item">
                                <span>{t("coupon_discount")}</span>
                                <span className="discount-amt-item">-₹{appliedCoupon.discountAmount}</span>
                            </div>
                        )}
                        <div className="summary-row">
                            <span>{t("delivery_fee")}</span>
                            <span>₹{deliveryFee}</span>
                        </div>
                        <div className="summary-row">
                            <span>{t("taxes")}</span>
                            <span>₹{taxes}</span>
                        </div>

                        <div className="summary-row total">
                            <span>{t("to_pay")}</span>
                            <span>₹{total}</span>
                        </div>

                        <button
                            className="checkout-btn"
                            onClick={handleCheckout}
                            disabled={ordering}
                        >
                            {ordering ? t("placing_order") : t("place_order")}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Cart;