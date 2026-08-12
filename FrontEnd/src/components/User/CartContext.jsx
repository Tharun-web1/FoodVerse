import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    // We store carts as an object: { [restaurantId]: { items: [], specialInstructions: "", lastUpdated: Number } }
    const [carts, setCarts] = useState(() => {
        const saved = localStorage.getItem("food_app_carts");
        return saved ? JSON.parse(saved) : {};
    });
    const [activeRestaurantId, setActiveRestaurantId] = useState(() => {
        return localStorage.getItem("food_app_active_res_id") || null;
    });

    useEffect(() => {
        localStorage.setItem("food_app_carts", JSON.stringify(carts));
        if (activeRestaurantId) {
            localStorage.setItem("food_app_active_res_id", activeRestaurantId);
        } else {
            localStorage.removeItem("food_app_active_res_id");
        }
    }, [carts, activeRestaurantId]);

    const addToCart = (item, resId, qty = 1) => {
        if (item.available === false) return;

        const isOfferValid = item.offerActive && item.discountPercentage > 0 && (!item.offerExpiryDate || new Date(item.offerExpiryDate) > new Date());
        const basePrice = item.originalPrice || item.price;
        const effectivePrice = isOfferValid
            ? Math.round(basePrice * (1 - item.discountPercentage / 100))
            : basePrice;

        const itemToAdd = {
            ...item,
            originalPrice: basePrice,
            price: effectivePrice,
            offerActive: item.offerActive,
            discountPercentage: item.discountPercentage,
            offerExpiryDate: item.offerExpiryDate
        };

        const targetItemId = item.id || item.itemId;

        setCarts(prev => {
            const currentCart = prev[resId] || { items: [], specialInstructions: "" };
            const existing = currentCart.items.find(ci => ci.itemId === targetItemId);
            let newItems;
            if (existing) {
                newItems = currentCart.items.map(ci => ci.itemId === targetItemId ? {
                    ...ci,
                    ...itemToAdd,
                    itemId: targetItemId,
                    qty: ci.qty + qty
                } : ci);
            } else {
                newItems = [...currentCart.items, { ...itemToAdd, itemId: targetItemId, qty: qty }];
            }
            return {
                ...prev,
                [resId]: {
                    ...currentCart,
                    items: newItems,
                    lastUpdated: Date.now()
                }
            };
        });
        setActiveRestaurantId(resId);
    };

    const removeFromCart = (itemId, resId) => {
        const targetResId = resId || activeRestaurantId;
        if (!targetResId) return;

        setCarts(prev => {
            const currentCart = prev[targetResId];
            if (!currentCart) return prev;

            const existing = currentCart.items.find(ci => ci.itemId === itemId);
            if (!existing) return prev;

            let newItems;
            if (existing.qty > 1) {
                newItems = currentCart.items.map(ci => ci.itemId === itemId ? { ...ci, qty: ci.qty - 1 } : ci);
            } else {
                newItems = currentCart.items.filter(ci => ci.itemId !== itemId);
            }

            const updatedCarts = { ...prev };
            if (newItems.length === 0) {
                delete updatedCarts[targetResId];
                if (activeRestaurantId === targetResId) {
                    const remainingResIds = Object.keys(updatedCarts).filter(id => updatedCarts[id]?.items?.length > 0);
                    setActiveRestaurantId(remainingResIds.length > 0 ? remainingResIds[0] : null);
                }
            } else {
                updatedCarts[targetResId] = {
                    ...currentCart,
                    items: newItems,
                    lastUpdated: Date.now()
                };
            }
            return updatedCarts;
        });
    };

    const clearCart = (resId) => {
        const targetResId = resId || activeRestaurantId;
        if (!targetResId) return;

        setCarts(prev => {
            const updatedCarts = { ...prev };
            delete updatedCarts[targetResId];
            
            if (activeRestaurantId === targetResId) {
                const remainingResIds = Object.keys(updatedCarts).filter(id => updatedCarts[id]?.items?.length > 0);
                setActiveRestaurantId(remainingResIds.length > 0 ? remainingResIds[0] : null);
            }
            return updatedCarts;
        });
    };

    const updateCartItemVariant = (oldItemId, newItem, resId) => {
        const targetResId = resId || activeRestaurantId;
        if (!targetResId || newItem.available === false) return;

        const isOfferValid = newItem.offerActive && newItem.discountPercentage > 0 && (!newItem.offerExpiryDate || new Date(newItem.offerExpiryDate) > new Date());
        const basePrice = newItem.originalPrice || newItem.price;
        const effectivePrice = isOfferValid
            ? Math.round(basePrice * (1 - newItem.discountPercentage / 100))
            : basePrice;

        setCarts(prev => {
            const currentCart = prev[targetResId];
            if (!currentCart) return prev;

            const oldItem = currentCart.items.find(ci => ci.itemId === oldItemId);
            if (!oldItem) return prev;

            const existingNew = currentCart.items.find(ci => ci.itemId === newItem.id);
            let newItems;
            if (existingNew) {
                newItems = currentCart.items
                    .map(ci => ci.itemId === newItem.id ? {
                        ...ci,
                        ...newItem,
                        itemId: newItem.id,
                        originalPrice: basePrice,
                        price: effectivePrice,
                        qty: ci.qty + oldItem.qty
                    } : ci)
                    .filter(ci => ci.itemId !== oldItemId);
            } else {
                newItems = currentCart.items.map(ci => ci.itemId === oldItemId ? {
                    ...ci,
                    ...newItem,
                    itemId: newItem.id,
                    id: newItem.id,
                    itemName: newItem.itemName,
                    originalPrice: basePrice,
                    price: effectivePrice,
                    serves: newItem.serves,
                    type: newItem.type,
                    offerActive: newItem.offerActive,
                    discountPercentage: newItem.discountPercentage,
                    offerExpiryDate: newItem.offerExpiryDate
                } : ci);
            }

            return {
                ...prev,
                [targetResId]: {
                    ...currentCart,
                    items: newItems,
                    lastUpdated: Date.now()
                }
            };
        });
    };

    const updateCartItemDetails = (itemId, details, resId) => {
        const targetResId = resId || activeRestaurantId;
        if (!targetResId) return;

        setCarts(prev => {
            const currentCart = prev[targetResId];
            if (!currentCart) return prev;

            const newItems = currentCart.items.map(ci => ci.itemId === itemId ? {
                ...ci,
                ...details
            } : ci);

            return {
                ...prev,
                [targetResId]: {
                    ...currentCart,
                    items: newItems,
                    lastUpdated: Date.now()
                }
            };
        });
    };

    const setSpecialInstructions = (instructions) => {
        if (!activeRestaurantId) return;
        setCarts(prev => {
            const currentCart = prev[activeRestaurantId] || { items: [], specialInstructions: "" };
            return {
                ...prev,
                [activeRestaurantId]: {
                    ...currentCart,
                    specialInstructions: instructions,
                    lastUpdated: Date.now()
                }
            };
        });
    };

    const cartItems = carts[activeRestaurantId]?.items || [];
    const restaurantId = activeRestaurantId;

    const totalItemsCount = Object.values(carts).reduce((total, cart) => {
        return total + (cart.items || []).reduce((sum, item) => sum + item.qty, 0);
    }, 0);

    return (
        <CartContext.Provider value={{
            carts,
            cartItems,
            restaurantId,
            totalItemsCount,
            activeRestaurantId,
            setActiveRestaurantId,
            addToCart,
            removeFromCart,
            clearCart,
            specialInstructions: carts[activeRestaurantId]?.specialInstructions || "",
            setSpecialInstructions,
            updateCartItemVariant,
            updateCartItemDetails
        }}>
            {children}
        </CartContext.Provider>
    );
};
