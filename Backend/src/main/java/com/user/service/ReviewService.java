package com.user.service;

import com.user.entity.Review;
import com.user.entity.Restuarent;
import com.user.entity.RestuarentItems;
import com.user.entity.UserEntity;
import com.user.repo.ReviewRepo;
import com.user.repo.RestuarentRepo;
import com.user.repo.RestuarentItemsRepo;
import com.user.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ReviewService {

    @Autowired
    private ReviewRepo reviewRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private RestuarentRepo restRepo;

    @Autowired
    private RestuarentItemsRepo itemRepo;

    public Review addReview(String username, Long restaurantId, Long itemId, Review review) {
        UserEntity user = userRepo.findByUsername(username);
        if (user == null) throw new RuntimeException("User not found");
        
        review.setUser(user);
        
        if (restaurantId != null) {
            Restuarent restaurant = restRepo.findById(restaurantId)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));
            review.setRestaurant(restaurant);
            
            // Save review first to include it in the average
            Review savedReview = reviewRepo.save(review);
            
            // Recalculate average rating for the restaurant
            List<Review> restaurantReviews = reviewRepo.findByRestaurantId(restaurantId);
            double avgRating = restaurantReviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
                
            restaurant.setRating(avgRating);
            restaurant.setReview(restaurantReviews.size());
            restRepo.save(restaurant);
            
            return savedReview;
        }
        
        if (itemId != null) {
            RestuarentItems item = itemRepo.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Item not found"));
            review.setItem(item);
        }
        
        return reviewRepo.save(review);
    }

    public List<com.user.dto.ReviewResponseDto> getReviewsByRestaurant(Long restaurantId) {
        List<Review> reviews = reviewRepo.findByRestaurantId(restaurantId);
        return reviews.stream().map(this::mapToResponseDto).collect(java.util.stream.Collectors.toList());
    }

    public List<com.user.dto.ReviewResponseDto> getReviewsByItem(Long itemId) {
        List<Review> reviews = reviewRepo.findByItemId(itemId);
        return reviews.stream().map(this::mapToResponseDto).collect(java.util.stream.Collectors.toList());
    }

    public List<com.user.dto.ReviewResponseDto> getAllReviews() {
        return reviewRepo.findAll().stream().map(this::mapToResponseDto).collect(java.util.stream.Collectors.toList());
    }

    private com.user.dto.ReviewResponseDto mapToResponseDto(Review review) {
        String profileImageUrl = null;
        if (review.getUser() != null && review.getUser().getId() != null) {
            profileImageUrl = "/users/" + review.getUser().getId() + "/profile-image";
        }
        
        return new com.user.dto.ReviewResponseDto(
            review.getId(),
            review.getUser() != null ? review.getUser().getId() : null,
            review.getUser() != null ? review.getUser().getUsername() : "Anonymous",
            profileImageUrl,
            review.getRating(),
            review.getComment(),
            review.getCreatedAt()
        );
    }
}
