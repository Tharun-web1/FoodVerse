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

    @PostMapping("/add")
    public Review addReview(
            @RequestParam(required = false) Long restaurantId,
            @RequestParam(required = false) Long itemId,
            @RequestBody Review review) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
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
