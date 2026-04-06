package com.user.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.user.entity.Cart;
import com.user.entity.UserEntity;
import com.user.repo.CartRepository;

@Service
public class CartService {
    
    @Autowired
    private CartRepository cartRepository;
    
    /**
     * Save or update user's cart
     * @param username - authenticated username
     * @param cartData - JSON string of cart items
     * @param restaurantId - restaurant ID
     */
    @Transactional
    public void saveCart(UserEntity user, String cartData, Long restaurantId) {
        
        Optional<Cart> existingCart = cartRepository.findByUser(user);
        
        if (existingCart.isPresent()) {
            // Update existing cart
            Cart cart = existingCart.get();
            cart.setCartData(cartData);
            cart.setRestaurantId(restaurantId);
            cart.setUpdatedAt(LocalDateTime.now());
            cartRepository.save(cart);
        } else {
            // Create new cart
            Cart newCart = new Cart(user, restaurantId, cartData, LocalDateTime.now());
            cartRepository.save(newCart);
        }
    }
    
    /**
     * Load user's cart
     * @param username - authenticated username
     * @return JSON string of cart data, or null if no cart exists
     */
    public String loadCart(UserEntity user) {
        Optional<Cart> cart = cartRepository.findByUser(user);
        return cart.map(Cart::getCartData).orElse(null);
    }
    
    /**
     * Get restaurant ID from user's cart
     * @param username - authenticated username
     * @return restaurant ID, or null if no cart exists
     */
    public Long getRestaurantId(UserEntity user) {
        Optional<Cart> cart = cartRepository.findByUser(user);
        return cart.map(Cart::getRestaurantId).orElse(null);
    }
    
    /**
     * Clear user's cart
     * @param username - authenticated username
     */
    @Transactional
    public void clearCart(UserEntity user) {
        cartRepository.deleteByUser(user);
    }
}
