import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    // Use localStorage for the cart to avoid CORS issues on non-existent backend cart endpoints
    // and align with the batch order placement logic in your backend.
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem("food_app_cart");
        return saved ? JSON.parse(saved) : [];
    });
    const [restaurantId, setRestaurantId] = useState(() => {
        return localStorage.getItem("food_app_res_id") || null;
    });

    useEffect(() => {
        localStorage.setItem("food_app_cart", JSON.stringify(cartItems));
        if (restaurantId) localStorage.setItem("food_app_res_id", restaurantId);
        else localStorage.removeItem("food_app_res_id");
    }, [cartItems, restaurantId]);

    const addToCart = (item, resId) => {
        if (item.available === false) return;

        // If switching restaurants, ask to clear cart
        if (restaurantId && resId !== restaurantId) {
            if (!window.confirm("Changing restaurants will clear your current cart. Proceed?")) return;
            setCartItems([{ ...item, itemId: item.id, qty: 1 }]);
            setRestaurantId(resId);
            return;
        }

        setRestaurantId(resId);
        setCartItems(prev => {
            const existing = prev.find(ci => ci.itemId === item.id);
            if (existing) {
                return prev.map(ci => ci.itemId === item.id ? { ...ci, qty: ci.qty + 1 } : ci);
            }
            return [...prev, { ...item, itemId: item.id, qty: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => {
            const existing = prev.find(ci => ci.itemId === itemId);
            if (!existing) return prev;
            if (existing.qty > 1) {
                return prev.map(ci => ci.itemId === itemId ? { ...ci, qty: ci.qty - 1 } : ci);
            }
            const updated = prev.filter(ci => ci.itemId !== itemId);
            if (updated.length === 0) setRestaurantId(null);
            return updated;
        });
    };

    const clearCart = () => {
        setCartItems([]);
        setRestaurantId(null);
        localStorage.removeItem("food_app_cart");
        localStorage.removeItem("food_app_res_id");
    };

    return (
        <CartContext.Provider value={{ cartItems, restaurantId, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
