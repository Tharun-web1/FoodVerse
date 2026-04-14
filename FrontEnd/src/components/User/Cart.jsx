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
import { FiMapPin, FiPlus, FiMinus, FiShoppingBag, FiTruck, FiCreditCard, FiPackage, FiPercent } from "react-icons/fi";

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
    const [pendingCancellationFee, setPendingCancellationFee] = useState(0);
    const [isFirstOrder, setIsFirstOrder] = useState(false);
    
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

            // Fetch user profile for pending fee
            axios.get(`${API_BASE_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                setPendingCancellationFee(res.data.pendingCancellationFee || 0);
            }).catch(err => console.error("Error fetching user profile", err));

            // Check if first order
            axios.get(`${API_BASE_URL}/orders/is-first-order`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                setIsFirstOrder(res.data);
            }).catch(err => console.error("Error checking first order status", err));
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
                let fee = Math.max(20, Math.round(dist * 15));
                if (isFirstOrder) {
                    fee = 0;
                }
                setDeliveryFee(fee);
            } else {
                setDeliveryFee(isFirstOrder ? 0 : 40); // Fallback
            }
        } else {
            setDeliveryFee(isFirstOrder ? 0 : 40); // Default/Fallback
        }
    }, [restaurant, selectedAddressId, isManualAddress, manualAddressData, addresses, cartItems, isFirstOrder]);

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const taxes = Math.round(subtotal * 0.05); // 5% tax
    const total = subtotal + deliveryFee + taxes + pendingCancellationFee - (appliedCoupon?.discountAmount || 0);

    useEffect(() => {
        if (subtotal > 0 && token) {
            axios.get(`${API_BASE_URL}/orders/available-coupons?total=${subtotal}&restaurantId=${restaurantId}`, {
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
            const response = await axios.post(`${API_BASE_URL}/orders/validate-coupon?code=${code}&total=${subtotal}&restaurantId=${restaurantId}`, {}, {
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
            pendingCancellationFee,
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
                    <div className="cart-items-section-v3">
                        {cartItems.map((item) => (
                            <div key={item.id} className="cart-item-card-v3">
                                <div className="item-main-details">
                                    <div className="item-title-row">
                                        <h3 className="item-name-v3">{item.itemName}</h3>
                                        <div className="item-type-tag veg"></div>
                                    </div>
                                    <p className="item-price-v3">₹{item.price}</p>
                                </div>
                                <div className="item-action-controls">
                                    <div className="qty-selector-v3">
                                        <button className="qty-btn-v3" onClick={() => removeFromCart(item.itemId)}><FiMinus /></button>
                                        <span className="qty-value-v3">{item.qty}</span>
                                        <button className="qty-btn-v3" onClick={() => addToCart({ id: item.itemId, itemName: item.itemName, price: item.price }, restaurantId)}><FiPlus /></button>
                                    </div>
                                    <div className="item-subtotal-v3">₹{item.price * item.qty}</div>
                                </div>
                            </div>
                        ))}

                        {/* Address Selection */}
                        <div className="address-section-v3">
                            <h2 className="section-title-v3">
                                <FiMapPin className="section-icon-v3" />
                                {t("delivery_address")}
                            </h2>

                            <div className="address-tabs-v3">
                                <button
                                    className={`address-tab-v3 ${!isManualAddress ? 'active' : ''}`}
                                    onClick={() => setIsManualAddress(false)}
                                >
                                    {t("saved_addresses")}
                                </button>
                                <button
                                    className={`address-tab-v3 ${isManualAddress ? 'active' : ''}`}
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
                    <div className="cart-summary-section-v3">
                        <h2 className="summary-title-v3">
                            <FiPackage className="section-icon-v3" />
                            {t("bill_details")}
                        </h2>
                        <div className="summary-row-v3">
                            <span>{t("item_total")}</span>
                            <span>₹{subtotal}</span>
                        </div>

                        {/* Apply Coupon UI */}
                        <div className="apply-coupon-container-v3">
                            <div className="coupon-integrated-bar-v3">
                                <FiPercent className="coupon-bar-icon-v3" />
                                <input 
                                    type="text" 
                                    placeholder={t("enter_coupon")} 
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                    className="coupon-input-v3"
                                    disabled={appliedCoupon}
                                />
                                {appliedCoupon ? (
                                    <button className="coupon-btn-v3 remove" onClick={() => { setAppliedCoupon(null); setCouponInput(""); }}>{t("remove")}</button>
                                ) : (
                                    <button className="coupon-btn-v3 apply" onClick={handleApplyCoupon}>{t("apply")}</button>
                                )}
                            </div>
                            {couponError && <p className="coupon-err-msg-v3">{couponError}</p>}
                            {appliedCoupon && <p className="coupon-ok-msg-v3">{t("coupon_applied_msg", { code: appliedCoupon.code })}</p>}

                            {/* Available Coupons */}
                            {availableCoupons.length > 0 && !appliedCoupon && (
                                <div className="available-coupons-section">
                                    <p className="available-coupons-title">{t("available_coupons")}</p>
                                    <div className="coupons-list-v3">
                                        {availableCoupons.map(cp => (
                                            <div key={cp.code} className="coupon-voucher-card-v3" onClick={() => handleApplyCoupon(cp.code)}>
                                                <div className="voucher-left-v3">
                                                    <div className="voucher-code-v3">{cp.code}</div>
                                                    <div className="voucher-desc-v3">{cp.description}</div>
                                                </div>
                                                <div className="voucher-right-v3">
                                                    <span className="apply-text-v3">{t("apply")}</span>
                                                </div>
                                                <div className="voucher-cutout-top"></div>
                                                <div className="voucher-cutout-bottom"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {appliedCoupon && (
                            <div className="summary-row-v3 discount-row-item">
                                <span>{t("coupon_discount")}</span>
                                <span className="discount-amt-item">-₹{appliedCoupon.discountAmount}</span>
                            </div>
                        )}
                        <div className="summary-row-v3">
                            <div className="row-label-with-icon">
                                <FiTruck className="row-icon-v3" />
                                <span>{t("delivery_fee")}</span>
                            </div>
                            <span className={isFirstOrder ? "free-delivery-text" : ""}>
                                {isFirstOrder ? t("free") : `₹${deliveryFee}`}
                            </span>
                        </div>
                        {isFirstOrder && (
                            <div className="first-order-badge">
                                <span className="badge-sparkle">✨</span>
                                {t("first_order_free_delivery")}
                            </div>
                        )}
                        {pendingCancellationFee > 0 && (
                            <div className="summary-row-v3 fee-row">
                                <div className="row-label-with-icon">
                                    <FiXCircle className="row-icon-v3" style={{ color: '#ff5630' }} />
                                    <span style={{ color: '#ff5630' }}>{t("late_cancellation_fee")}</span>
                                </div>
                                <span style={{ color: '#ff5630' }}>₹{pendingCancellationFee}</span>
                            </div>
                        )}
                        <div className="summary-row-v3">
                            <span>{t("taxes")}</span>
                            <span>₹{taxes}</span>
                        </div>

                        <div className="summary-row-v3 total-row-v3">
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