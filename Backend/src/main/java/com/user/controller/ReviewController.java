package com.user.controller;

import com.user.entity.Review;
import com.user.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@CrossOrigin("*")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private com.user.service.RiderService riderService;

    @PostMapping("/add")
    public Review addReview(
            @RequestParam(required = false) Long restaurantId,
            @RequestParam(required = false) Long itemId,
            @RequestParam(required = false) Integer deliveryPartnerId,
            @RequestParam(required = false) Double deliveryRating,
            @RequestBody Review review) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (deliveryPartnerId != null && deliveryRating != null) {
            riderService.rateRider(deliveryPartnerId, deliveryRating);
        }
        return reviewService.addReview(username, restaurantId, itemId, review);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<com.user.dto.ReviewResponseDto> getRestaurantReviews(@PathVariable("restaurantId") Long restaurantId) {
        return reviewService.getReviewsByRestaurant(restaurantId);
    }

    @GetMapping("/item/{itemId}")
    public List<com.user.dto.ReviewResponseDto> getItemReviews(@PathVariable("itemId") Long itemId) {
        return reviewService.getReviewsByItem(itemId);
    }
}
