import { useNavigate, useLocation } from "react-router-dom";
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
import { FiMapPin, FiPlus, FiMinus, FiShoppingBag, FiTruck, FiCreditCard, FiPackage, FiPercent, FiArrowLeft, FiXCircle } from "react-icons/fi";

const Cart = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const {
        carts,
        cartItems,
        restaurantId,
        setActiveRestaurantId,
        addToCart,
        removeFromCart,
        clearCart,
        specialInstructions,
        updateCartItemVariant,
        updateCartItemDetails
    } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [ordering, setOrdering] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [restaurant, setRestaurant] = useState(null);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [baseDeliveryFee, setBaseDeliveryFee] = useState(40);
    const [isManualAddress, setIsManualAddress] = useState(false);
    const [pendingCancellationFee, setPendingCancellationFee] = useState(0);
    const [isFirstOrder, setIsFirstOrder] = useState(false);

    useEffect(() => {
        if (menuItems.length > 0 && cartItems.length > 0) {
            cartItems.forEach(ci => {
                const match = menuItems.find(mi => mi.id === ci.itemId);
                if (match) {
                    const isOfferValid = match.offerActive && match.discountPercentage > 0 && (!match.offerExpiryDate || new Date(match.offerExpiryDate) > new Date());
                    const basePrice = match.originalPrice || match.price;
                    const effectivePrice = isOfferValid
                        ? Math.round(basePrice * (1 - match.discountPercentage / 100))
                        : basePrice;

                    if (ci.price !== effectivePrice || ci.originalPrice !== basePrice || ci.offerActive !== match.offerActive || ci.discountPercentage !== match.discountPercentage) {
                        updateCartItemDetails(ci.itemId, {
                            originalPrice: basePrice,
                            price: effectivePrice,
                            offerActive: match.offerActive,
                            discountPercentage: match.discountPercentage,
                            offerExpiryDate: match.offerExpiryDate
                        });
                    }
                }
            });
        }
    }, [menuItems, cartItems, updateCartItemDetails]);

    // Coupon State
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const resId = queryParams.get("resId") || localStorage.getItem("food_app_active_res_id");
        if (resId) {
            const saved = sessionStorage.getItem(`food_app_coupon_${resId}`);
            if (saved) {
                try { return JSON.parse(saved); } catch (e) { return null; }
            }
        }
        return null;
    });
    const [couponError, setCouponError] = useState("");
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [showCouponsOverlay, setShowCouponsOverlay] = useState(false);
    const [localSelectedCoupon, setLocalSelectedCoupon] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addBitezyOnePass, setAddBitezyOnePass] = useState(false);

    const isBitezyOneMember = localStorage.getItem('isBitezyOneMember') === 'true';

    const handleCartBack = () => {
        if (location.state?.from) {
            navigate(location.state.from);
        } else if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else if (restaurantId) {
            navigate(`/restaurant/${restaurantId}`);
        } else {
            navigate("/user");
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const queryResId = queryParams.get("resId");
        if (queryResId) {
            setActiveRestaurantId(queryResId);
        } else if (!restaurantId) {
            const activeResIds = Object.keys(carts || {}).filter(id => carts[id]?.items?.length > 0);
            if (activeResIds.length > 0) {
                setActiveRestaurantId(activeResIds[0]);
            }
        }
    }, [location.search, carts, restaurantId, setActiveRestaurantId]);

    // Add Address Form States
    const [showAddAddressModal, setShowAddAddressModal] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);
    const [newAddressForm, setNewAddressForm] = useState({
        addressLine: "",
        city: "",
        state: "",
        zipCode: "",
        addressType: "Home",
        latitude: 17.3850,
        longitude: 78.4867
    });

    const [manualAddressData, setManualAddressData] = useState({
        addressLine: "",
        city: "",
        state: "",
        zipCode: ""
    });
    const token = localStorage.getItem("token");

    const loadAddresses = () => {
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
    };

    const handleSaveNewAddress = async (e) => {
        e.preventDefault();
        setSavingAddress(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/users/addresses/add`, newAddressForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Re-fetch addresses
            axios.get(`${API_BASE_URL}/users/addresses`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(fetchRes => {
                setAddresses(fetchRes.data);
                if (res.data && res.data.id) {
                    setSelectedAddressId(res.data.id);
                } else if (fetchRes.data.length > 0) {
                    const match = fetchRes.data.find(a => a.addressLine === newAddressForm.addressLine);
                    if (match) setSelectedAddressId(match.id);
                }
            });
            showToast("Address saved successfully", "success");
            setShowAddAddressModal(false);
            setNewAddressForm({
                addressLine: "",
                city: "",
                state: "",
                zipCode: "",
                addressType: "Home",
                latitude: 17.3850,
                longitude: 78.4867
            });
        } catch (err) {
            console.error("Error saving address", err);
            showToast("Failed to save address", "error");
        } finally {
            setSavingAddress(false);
        }
    };

    useEffect(() => {
        if (token) {
            loadAddresses();

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

            axios.get(`${API_BASE_URL}/restaurants/${restaurantId}/items`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                setMenuItems(res.data);
            }).catch(err => console.error("Error fetching restaurant items in cart", err));
        } else {
            setRestaurant(null);
            setMenuItems([]);
        }
    }, [token, restaurantId]);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    useEffect(() => {
        const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
        if (subtotal === 0) {
            setDeliveryFee(0);
            setBaseDeliveryFee(40);
            return;
        }

        let calculatedBaseFee = 40;
        if (restaurant && (selectedAddressId || isManualAddress)) {
            const addr = isManualAddress ? manualAddressData : addresses.find(a => a.id === selectedAddressId);
            if (addr && addr.latitude && addr.longitude) {
                const dist = calculateDistance(
                    parseFloat(restaurant.r_lat),
                    parseFloat(restaurant.r_lon),
                    parseFloat(addr.latitude),
                    parseFloat(addr.longitude)
                );
                calculatedBaseFee = Math.max(20, Math.round(dist * 15));
            }
        }
        setBaseDeliveryFee(calculatedBaseFee);

        const isBitezyOne = localStorage.getItem('isBitezyOneMember') === 'true';
        const isFreeDeliveryEligible = isFirstOrder || (isBitezyOne && subtotal >= 99) || (addBitezyOnePass && !isBitezyOne && subtotal >= 99);
        if (isFreeDeliveryEligible) {
            setDeliveryFee(0);
        } else {
            setDeliveryFee(calculatedBaseFee);
        }
    }, [restaurant, selectedAddressId, isManualAddress, manualAddressData, addresses, cartItems, isFirstOrder, addBitezyOnePass]);

    const getSiblingVariants = (cartItemName) => {
        if (!cartItemName) return [];
        const baseName = cartItemName.trim().toLowerCase();
        return menuItems.filter(
            i => i.itemName?.trim().toLowerCase() === baseName && i.available && i.serves
        ).sort((a, b) => a.price - b.price);
    };

    const handleVariantChange = (oldItemId, targetVariantId) => {
        const target = menuItems.find(mi => mi.id === targetVariantId);
        if (target) {
            updateCartItemVariant(oldItemId, target);
        }
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const taxes = Math.round(subtotal * 0.05); // 5% tax
    const passCost = (addBitezyOnePass && !isBitezyOneMember) ? 1 : 0;
    const total = subtotal + deliveryFee + taxes + pendingCancellationFee + passCost - (appliedCoupon?.discountAmount || 0);

    useEffect(() => {
        if (restaurantId && token) {
            axios.get(`${API_BASE_URL}/orders/available-coupons?total=0&restaurantId=${restaurantId}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                setAvailableCoupons(res.data);
            }).catch(err => console.error("Error fetching coupons", err));
        } else {
            setAvailableCoupons([]);
        }
    }, [restaurantId, token]);

    useEffect(() => {
        if (restaurantId) {
            if (appliedCoupon) {
                sessionStorage.setItem(`food_app_coupon_${restaurantId}`, JSON.stringify(appliedCoupon));
            } else {
                sessionStorage.removeItem(`food_app_coupon_${restaurantId}`);
            }
        }
    }, [appliedCoupon, restaurantId]);

    useEffect(() => {
        if (restaurantId && !appliedCoupon) {
            const saved = sessionStorage.getItem(`food_app_coupon_${restaurantId}`);
            if (saved) {
                try {
                    setAppliedCoupon(JSON.parse(saved));
                } catch (e) {
                    console.error("Error restoring coupon", e);
                }
            }
        }
    }, [restaurantId]);

    useEffect(() => {
        if (appliedCoupon) {
            setLocalSelectedCoupon(appliedCoupon);
        } else {
            setLocalSelectedCoupon(null);
        }
    }, [appliedCoupon]);

    useEffect(() => {
        if (appliedCoupon && availableCoupons.length > 0) {
            const couponDetail = availableCoupons.find(cp => cp.code === appliedCoupon.code);
            if (couponDetail) {
                const minAmount = couponDetail.minOrderAmount || 0;
                if (subtotal < minAmount) {
                    setAppliedCoupon(null);
                    setCouponInput("");
                    showToast(`Coupon '${appliedCoupon.code}' removed as min order of ₹${minAmount} not met.`, "warning");
                }
            }
        }
    }, [subtotal, availableCoupons, appliedCoupon, showToast]);

    const getBestRecommendedCoupon = () => {
        const eligible = availableCoupons.filter(cp => subtotal >= (cp.minOrderAmount || 0));
        if (eligible.length === 0) return null;
        const sorted = [...eligible].sort((a, b) => {
            const valA = a.discountAmount || 0;
            const valB = b.discountAmount || 0;
            return valB - valA;
        });
        return sorted[0];
    };

    const handleApplyCoupon = async (codeOverride = null) => {
        const code = (typeof codeOverride === 'string' ? codeOverride : couponInput).trim();
        if (!code) return false;
        setCouponError("");
        try {
            const response = await axios.post(`${API_BASE_URL}/orders/validate-coupon?code=${code}&total=${subtotal}&restaurantId=${restaurantId}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setAppliedCoupon(response.data);
            if (showToast) {
                showToast(t("coupon_applied"), "success");
            } else {
                alert(t("coupon_applied"));
            }
            return true;
        } catch (err) {
            setAppliedCoupon(null);
            const rawMsg = err.response?.data?.message || "invalid_coupon";
            let msg = t(rawMsg);
            if (msg === rawMsg) {
                // Fallback translation mappings
                if (rawMsg === "expired_coupon") msg = t("expired_coupon_msg") || "Coupon has expired";
                else if (rawMsg === "invalid_coupon") msg = t("invalid_coupon_msg") || "Invalid coupon code";
                else if (rawMsg === "min_order_not_met") msg = t("min_order_not_met_msg") || "Minimum order amount not met";
                else if (rawMsg === "first_order_only") msg = t("first_order_only_msg") || "Coupon is valid for first order only";
                else msg = t("invalid_coupon_msg") || "Invalid coupon code";
            }
            setCouponError(msg);
            if (typeof showToast !== 'undefined') {
                showToast(msg, "error");
            } else {
                alert(msg);
            }
            return false;
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

        if (!selectedAddressId) {
            showToast("Please add a delivery address in your profile page first", "warning");
            navigate("/profile", { state: { activeTab: "address", from: "/cart" } });
            return;
        }

        const selectedAddrObj = addresses.find(a => a.id === selectedAddressId);
        const displayAddress = selectedAddrObj
            ? `${selectedAddrObj.addressLine}, ${selectedAddrObj.city}, ${selectedAddrObj.state} ${selectedAddrObj.zipCode}`
            : t("saved_address");

        // Instead of placing order, redirect to payment page
        const orderData = {
            restaurantId: parseInt(restaurantId),
            addressId: selectedAddressId,
            manualAddress: null,
            displayAddress,
            latitude: selectedAddrObj?.latitude,
            longitude: selectedAddrObj?.longitude,
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
            discountAmount: appliedCoupon?.discountAmount || 0,
            specialInstructions: specialInstructions || null
        };

        if (addBitezyOnePass && !isBitezyOneMember) {
            const now = new Date();
            now.setDate(now.getDate() + 30);
            const expiryStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            localStorage.setItem('isBitezyOneMember', 'true');
            localStorage.setItem('bitezyOnePlan', '1 Month Trial Pass');
            localStorage.setItem('bitezyOnePlanId', 'trial_1m');
            localStorage.setItem('bitezyOneSavings', '35');
            localStorage.setItem('bitezyOneExpiry', expiryStr);
        }

        navigate("/payment", { state: { orderData } });
    };

    if (cartItems.length === 0) {
        return (
            <>
                <Navbar />
                <div className="cart-page-wrapper-v3">
                    <div className="cart-page-container">
                        <div className="cart-header-row">
                            <button className="cart-back-btn" onClick={handleCartBack} aria-label="Go Back">
                                <FiArrowLeft />
                            </button>
                            <h1 className="cart-title">{t("cart_title")}</h1>
                        </div>
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
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="cart-page-wrapper-v3">
                <div className="cart-page-container">
                    <div className="cart-header-row">
                        <button className="cart-back-btn" onClick={handleCartBack} aria-label="Go Back">
                            <FiArrowLeft />
                        </button>
                        <h1 className="cart-title">{t("cart_title")}</h1>
                    </div>

                    <div className="cart-content-layout">
                        {/* LEFT: Items List */}
                        <div className="cart-items-section-v3">
                            {cartItems.map((item) => (
                                <div key={item.id} className="cart-item-card-v3">
                                    {/* Left Section: Item Name, Price and Variant/Quantity */}
                                    <div className="item-details-left">
                                        <div className="item-title-row">
                                            <div className={`food-mark ${item.type?.toLowerCase() === "veg" ? "veg" : "nonveg"}`}>
                                                <div className="food-mark-dot"></div>
                                            </div>
                                            <h3 className="item-name-v3">{item.itemName}</h3>
                                        </div>
                                        <div className="item-meta-row">
                                            <span className="item-price-v3">₹{item.price}</span>
                                            {item.originalPrice && item.originalPrice > item.price && (
                                                <>
                                                    <span className="item-original-price-v3" style={{ textDecoration: "line-through", color: "#94a3b8", fontSize: "12px", marginLeft: "4px" }}>
                                                        ₹{item.originalPrice}
                                                    </span>
                                                    {item.discountPercentage > 0 && (
                                                        <span className="item-discount-tag-v3" style={{ background: "#ecfdf5", color: "#059669", fontSize: "11px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", marginLeft: "4px" }}>
                                                            {Math.round(item.discountPercentage)}% OFF
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                            {getSiblingVariants(item.itemName).length > 1 ? (
                                                <div className="item-variant-select-wrapper">
                                                    <select
                                                        className="item-variant-select-v3"
                                                        value={item.itemId}
                                                        onChange={(e) => handleVariantChange(item.itemId, parseInt(e.target.value))}
                                                    >
                                                        {getSiblingVariants(item.itemName).map((v) => (
                                                            <option key={v.id} value={v.id}>
                                                                {v.serves}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <span className="select-arrow">▼</span>
                                                </div>
                                            ) : (
                                                item.serves && (
                                                    <span className="item-variant-v3">{item.serves}</span>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Section: Image on top, Counter below */}
                                    <div className="item-action-right">
                                        <img
                                            src={`${API_BASE_URL}/restaurants/${item.itemId}/itemimg`}
                                            alt={item.itemName}
                                            className="cart-item-thumb-v3"
                                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop"; }}
                                        />
                                        <div className="qty-selector-v3">
                                            <button className="qty-btn-v3" onClick={() => removeFromCart(item.itemId)}><FiMinus /></button>
                                            <span className="qty-value-v3">{item.qty}</span>
                                            <button className="qty-btn-v3" onClick={() => addToCart(item, restaurantId)}><FiPlus /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Left items container ends */}
                        </div>

                        {/* RIGHT SIDEBAR: Coupon Card + Bill Summary */}
                        <div className="cart-sidebar-section-v3">
                            {/* Combined Address & Coupon Card (Unified UX style) */}
                            <div className="cart-combined-card-v3">
                                {/* Row 1: Address selection */}
                                <div className="combined-card-row-v3 address-row-v3" onClick={() => setShowAddressModal(true)}>
                                    <div className="row-left-icon-box-v3 pin-v3">
                                        <FiMapPin className="row-icon-v3" />
                                    </div>
                                    <div className="row-text-group-v3">
                                        <h4 className="row-main-title-v3">
                                            {addresses.find(a => a.id === selectedAddressId)
                                                ? `Delivery at ${addresses.find(a => a.id === selectedAddressId).addressType}`
                                                : 'Select Delivery Address'}
                                        </h4>
                                        <p className="row-subtitle-v3">
                                            {addresses.find(a => a.id === selectedAddressId)
                                                ? `${addresses.find(a => a.id === selectedAddressId).addressLine}, ${addresses.find(a => a.id === selectedAddressId).city}`.substring(0, 42) + '...'
                                                : 'Please choose an address'}
                                        </p>
                                    </div>
                                    <div className="row-right-chevron-v3">
                                        <span className="chevron-arrow-v3">▸</span>
                                    </div>
                                </div>

                                <div className="combined-card-divider-v3"></div>

                                {/* Row 2: Coupon apply */}
                                <div className="combined-card-row-v3 coupon-row-v3">
                                    <div className="row-left-icon-box-v3 percent-v3">
                                        <FiPercent className="row-icon-v3" />
                                    </div>
                                    <div className="row-text-group-v3">
                                        {appliedCoupon ? (
                                            <>
                                                <h4 className="row-main-title-v3">Code '{appliedCoupon.code}' applied!</h4>
                                                <p className="row-subtitle-v3 success-v3">Saved ₹{appliedCoupon.discountAmount} on this order</p>
                                            </>
                                        ) : getBestRecommendedCoupon() ? (
                                            <>
                                                <h4 className="row-main-title-v3">Save ₹{getBestRecommendedCoupon().discountAmount} with '{getBestRecommendedCoupon().code}'</h4>
                                                <button className="coupon-view-link-v3" onClick={() => setShowCouponsOverlay(true)}>
                                                    View all coupons <span className="red-arrow-v3">▸</span>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <h4 className="row-main-title-v3">Apply coupons</h4>
                                                <button className="coupon-view-link-v3" onClick={() => setShowCouponsOverlay(true)}>
                                                    View all coupons <span className="red-arrow-v3">▸</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    <div className="row-right-action-v3">
                                        {appliedCoupon ? (
                                            <button className="coupon-outline-btn-v3 remove" onClick={() => { setAppliedCoupon(null); setCouponInput(""); }}>
                                                REMOVE
                                            </button>
                                        ) : getBestRecommendedCoupon() ? (
                                            <button className="coupon-outline-btn-v3 apply" onClick={() => handleApplyCoupon(getBestRecommendedCoupon().code)}>
                                                APPLY
                                            </button>
                                        ) : (
                                            <button className="coupon-outline-btn-v3 apply" onClick={() => setShowCouponsOverlay(true)}>
                                                VIEW
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bitezy One 1-Month Pass Add-on Card for Non-Members */}
                            {!isBitezyOneMember && (
                                <div className={`cart-bitezy-one-card ${addBitezyOnePass ? 'active' : ''}`}>
                                    <div className="one-card-left">
                                        <div className="one-card-icon-box">👑</div>
                                        <div className="one-card-text">
                                            <div className="one-card-title-row">
                                                <span className="one-card-brand">bitezy <span className="one-card-italic">one</span></span>
                                                <span className="one-card-badge">₹1 LAUNCH DEAL</span>
                                            </div>
                                            <p className="one-card-desc">
                                                {subtotal >= 99
                                                    ? `Save ₹${baseDeliveryFee || 40} on this order + get 1-Month Free Delivery Pass`
                                                    : "Get 1-Month Free Delivery Pass on orders above ₹99"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className={`one-card-add-btn ${addBitezyOnePass ? 'added' : ''}`}
                                        onClick={() => {
                                            const nextState = !addBitezyOnePass;
                                            setAddBitezyOnePass(nextState);
                                            if (showToast) {
                                                showToast(
                                                    nextState ? "Bitezy One Pass added! Free delivery unlocked." : "Bitezy One Pass removed.",
                                                    nextState ? "success" : "info"
                                                );
                                            }
                                        }}
                                    >
                                        {addBitezyOnePass ? 'ADDED ✓' : 'ADD ₹1'}
                                    </button>
                                </div>
                            )}

                            {/* Bill Summary Section */}
                            <div className="cart-summary-section-v3">
                                <h2 className="summary-title-v3">
                                    <FiPackage className="section-icon-v3" />
                                    {t("bill_details")}
                                </h2>
                                <div className="summary-row-v3">
                                    <span>{t("item_total")}</span>
                                    <span>₹{subtotal}</span>
                                </div>

                                {addBitezyOnePass && !isBitezyOneMember && (
                                    <div className="summary-row-v3 discount-row-item" style={{ color: '#d4af37' }}>
                                        <div className="row-label-with-icon">
                                            <span style={{ fontSize: '14px', marginRight: '4px' }}>👑</span>
                                            <span style={{ color: '#b45309', fontWeight: '700' }}>Bitezy One 1-Month Pass</span>
                                        </div>
                                        <span style={{ color: '#b45309', fontWeight: '800' }}>+₹1</span>
                                    </div>
                                )}

                                {appliedCoupon && (
                                    <div className="summary-row-v3 discount-row-item">
                                        <span>{t("coupon_discount")}</span>
                                        <span className="discount-amt-item">-₹{appliedCoupon.discountAmount}</span>
                                    </div>
                                )}
                                {(() => {
                                    const isBitezyOneMember = localStorage.getItem('isBitezyOneMember') === 'true';
                                    const isBitezyOneFree = isBitezyOneMember && subtotal >= 99;
                                    const isFreeDelivery = isFirstOrder || isBitezyOneFree || deliveryFee === 0;

                                    return (
                                        <div className="summary-row-v3">
                                            <div className="row-label-with-icon">
                                                <FiTruck className="row-icon-v3" />
                                                <span>{t("delivery_fee")}</span>
                                            </div>
                                            {isFreeDelivery ? (
                                                <span>
                                                    <span style={{ textDecoration: 'line-through', color: '#94a3b8', marginRight: '6px', fontSize: '13px' }}>
                                                        ₹{baseDeliveryFee || 40}
                                                    </span>
                                                    <span style={{ color: '#000000ff' }}>FREE</span>
                                                </span>
                                            ) : (
                                                <span>₹{deliveryFee}</span>
                                            )}
                                        </div>
                                    );
                                })()}
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
                </div>

                {/* Coupons Full Screen Overlay (Image 2 style) */}
                {showCouponsOverlay && (
                    <div className="coupons-overlay-v3">
                        {/* Header */}
                        <div className="coupons-overlay-header-v3">
                            <button className="coupons-back-btn-v3" onClick={() => setShowCouponsOverlay(false)} aria-label="Back to Cart">
                                <FiArrowLeft />
                            </button>
                            <h1 className="coupons-title-v3">Coupons</h1>
                        </div>

                        <div className="coupons-overlay-content-v3">
                            {/* Coupon Code Input */}
                            <div className="overlay-coupon-input-container-v3">
                                <input
                                    type="text"
                                    placeholder="Have a coupon code? Type here"
                                    value={couponInput}
                                    onChange={(e) => {
                                        setCouponInput(e.target.value.toUpperCase());
                                        setCouponError(""); // Clear error when typing
                                    }}
                                    className="overlay-coupon-input-v3"
                                />
                                <button
                                    className="overlay-coupon-apply-btn-v3"
                                    onClick={async () => {
                                        const success = await handleApplyCoupon(couponInput);
                                        if (success) {
                                            setShowCouponsOverlay(false);
                                        }
                                    }}
                                    disabled={!couponInput.trim()}
                                >
                                    APPLY
                                </button>
                            </div>
                            {couponError && (
                                <div className="coupon-error-message-v3">
                                    {couponError}
                                </div>
                            )}

                            {/* Cashback Banner Mockup */}
                            <div className="amazon-promo-banner-v3">
                                <div className="amazon-banner-left-v3">
                                    <span className="amazon-brand-v3">amazon pay</span>
                                    <h3>3% cashback on all orders</h3>
                                    <p>with Amazon Pay Balance</p>
                                    <span className="know-more-btn-v3">Know more ➔</span>
                                </div>
                                <div className="amazon-banner-right-v3">
                                    <div className="amazon-phone-mockup-v3">
                                        <div className="amazon-pay-badge-v3">pay</div>
                                    </div>
                                </div>
                                <div className="banner-dots-v3">
                                    <span className="dot-v3 active"></span>
                                    <span className="dot-v3"></span>
                                </div>
                            </div>

                            {/* Restaurant coupons section */}
                            <div className="restaurant-coupons-section-v3">
                                <div className="section-header-v3">
                                    <h3>Restaurant coupons</h3>
                                    {appliedCoupon && (
                                        <button className="clear-coupon-btn-v3" onClick={() => {
                                            setAppliedCoupon(null);
                                            setCouponInput("");
                                            setLocalSelectedCoupon(null);
                                        }}>
                                            Clear
                                        </button>
                                    )}
                                </div>

                                <div className="overlay-coupons-list-v3">
                                    {availableCoupons.map(cp => {
                                        const isEligible = subtotal >= (cp.minOrderAmount || 0);
                                        const neededAmount = (cp.minOrderAmount || 0) - subtotal;
                                        const isSelected = localSelectedCoupon && localSelectedCoupon.code === cp.code;

                                        return (
                                            <div
                                                key={cp.code}
                                                className={`overlay-coupon-card-v3 ${!isEligible ? 'locked' : ''} ${isSelected ? 'selected' : ''}`}
                                                onClick={() => {
                                                    if (isEligible) {
                                                        setLocalSelectedCoupon(cp);
                                                    }
                                                }}
                                            >
                                                <div className="coupon-card-left-v3">
                                                    <div className={`coupon-icon-bullet-v3 ${!isEligible ? 'grey' : ''}`}>
                                                        %
                                                    </div>
                                                    <div className="coupon-info-col-v3">
                                                        <div className="coupon-card-title-v3">
                                                            <h4>Flat ₹{cp.discountAmount || 0} OFF</h4>
                                                            <span className="info-icon-v3">ⓘ</span>
                                                        </div>
                                                        {isEligible ? (
                                                            <p className="coupon-card-desc-v3 eligible">Save ₹{(cp.discountAmount || 0).toFixed(0)} with this code</p>
                                                        ) : (
                                                            <p className="coupon-card-desc-v3 locked">Add eligible items worth ₹{neededAmount.toFixed(0)} more to unlock</p>
                                                        )}
                                                        <span className="coupon-card-code-v3">{cp.code}</span>
                                                    </div>
                                                </div>
                                                <div className="coupon-card-right-v3">
                                                    {isEligible && (
                                                        <div className={`coupon-radio-v3 ${isSelected ? 'checked' : ''}`}>
                                                            <div className="radio-dot-v3"></div>
                                                        </div>
                                                    )}
                                                    {!isEligible && (
                                                        <div className="coupon-radio-v3 disabled"></div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Floating Apply Bar */}
                        {localSelectedCoupon && (
                            <div className="bottom-coupon-apply-bar-v3">
                                <div className="bottom-coupon-alert-title-v3">
                                    <span className="emoji-v3">🥳</span> Coupon selected for you
                                </div>
                                <div className="bottom-coupon-pill-v3">
                                    <span className="percent-badge-small-v3">%</span> Save ₹{(localSelectedCoupon.discountAmount || 0).toFixed(0)} with '{localSelectedCoupon.code}'
                                </div>
                                <button
                                    className="bottom-coupon-apply-btn-v3"
                                    onClick={async () => {
                                        const success = await handleApplyCoupon(localSelectedCoupon.code);
                                        if (success) {
                                            setShowCouponsOverlay(false);
                                        }
                                    }}
                                >
                                    Tap to apply
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Address Selection Bottom Sheet Drawer Modal (Image 2 style triggers it) */}
                {showAddressModal && (
                    <div className="address-drawer-overlay-v3" onClick={() => setShowAddressModal(false)}>
                        <div className="address-drawer-sheet-v3" onClick={(e) => e.stopPropagation()}>
                            <div className="address-drawer-header-v3">
                                <h3>Choose Delivery Address</h3>
                                <button className="address-drawer-close-btn-v3" onClick={() => setShowAddressModal(false)} aria-label="Close Address Modal"><FiXCircle /></button>
                            </div>
                            <div className="address-drawer-content-v3">
                                <div className="address-options-list-v3">
                                    {addresses.map(addr => (
                                        <div
                                            key={addr.id}
                                            className={`address-option-card-v3 ${selectedAddressId === addr.id ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedAddressId(addr.id);
                                                setShowAddressModal(false);
                                            }}
                                        >
                                            <div className="addr-bullet-icon-box-v3">
                                                <FiMapPin className="addr-bullet-pin-v3" />
                                            </div>
                                            <div className="addr-option-details-v3">
                                                <h5>{addr.addressType}</h5>
                                                <p>{addr.addressLine}, {addr.city}, {addr.state} - {addr.zipCode}</p>
                                            </div>
                                            <div className="addr-option-radio-v3">
                                                <div className={`radio-circle-v3 ${selectedAddressId === addr.id ? 'checked' : ''}`}>
                                                    <div className="radio-dot-v3"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="add-new-address-btn-v3" onClick={() => { setShowAddressModal(false); setShowAddAddressModal(true); }}>
                                    + Add New Address
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Address Form Modal Overlay */}
                {showAddAddressModal && (
                    <div className="add-address-overlay-v3" onClick={() => setShowAddAddressModal(false)}>
                        <div className="add-address-sheet-v3" onClick={(e) => e.stopPropagation()}>
                            <div className="add-address-header-v3">
                                <h3>Add Delivery Address</h3>
                                <button className="add-address-close-btn-v3" onClick={() => setShowAddAddressModal(false)} aria-label="Close Add Address Modal"><FiXCircle /></button>
                            </div>
                            <form onSubmit={handleSaveNewAddress} className="add-address-form-v3">
                                <div className="address-type-selector-v3">
                                    <button
                                        type="button"
                                        className={`type-btn-v3 ${newAddressForm.addressType === 'Home' ? 'active' : ''}`}
                                        onClick={() => setNewAddressForm(prev => ({ ...prev, addressType: 'Home' }))}
                                    >
                                        Home
                                    </button>
                                    <button
                                        type="button"
                                        className={`type-btn-v3 ${newAddressForm.addressType === 'Work' ? 'active' : ''}`}
                                        onClick={() => setNewAddressForm(prev => ({ ...prev, addressType: 'Work' }))}
                                    >
                                        Work
                                    </button>
                                    <button
                                        type="button"
                                        className={`type-btn-v3 ${newAddressForm.addressType === 'Other' ? 'active' : ''}`}
                                        onClick={() => setNewAddressForm(prev => ({ ...prev, addressType: 'Other' }))}
                                    >
                                        Other
                                    </button>
                                </div>

                                <div className="form-field-v3">
                                    <label>Address Line</label>
                                    <input
                                        type="text"
                                        placeholder="House No, Street name, Area"
                                        value={newAddressForm.addressLine}
                                        onChange={(e) => setNewAddressForm(prev => ({ ...prev, addressLine: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="form-row-two-col-v3">
                                    <div className="form-field-v3">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            placeholder="City"
                                            value={newAddressForm.city}
                                            onChange={(e) => setNewAddressForm(prev => ({ ...prev, city: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="form-field-v3">
                                        <label>State</label>
                                        <input
                                            type="text"
                                            placeholder="State"
                                            value={newAddressForm.state}
                                            onChange={(e) => setNewAddressForm(prev => ({ ...prev, state: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-field-v3">
                                    <label>Pincode / Zip Code</label>
                                    <input
                                        type="text"
                                        placeholder="6-digit pincode"
                                        value={newAddressForm.zipCode}
                                        onChange={(e) => setNewAddressForm(prev => ({ ...prev, zipCode: e.target.value }))}
                                        required
                                    />
                                </div>

                                <button type="submit" className="save-address-submit-btn-v3" disabled={savingAddress}>
                                    {savingAddress ? 'Saving Address...' : 'Save Address'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Cart;