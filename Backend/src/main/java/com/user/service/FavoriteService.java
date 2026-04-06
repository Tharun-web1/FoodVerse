package com.user.service;

import com.user.entity.FavoriteRestaurant;
import com.user.entity.Restuarent;
import com.user.entity.UserEntity;
import com.user.repo.FavoriteRepo;
import com.user.repo.RestuarentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class FavoriteService {

    @Autowired
    private FavoriteRepo favoriteRepo;

    @Autowired
    private RestuarentRepo restRepo;

    public void toggleFavorite(UserEntity user, Long restaurantId) {
        if (user == null) throw new RuntimeException("User not found");

        Optional<FavoriteRestaurant> existing = favoriteRepo.findByUser_IdAndRestaurant_Id(user.getId(), restaurantId);

        if (existing.isPresent()) {
            favoriteRepo.delete(existing.get());
        } else {
            Restuarent restaurant = restRepo.findById(restaurantId)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));
            
            FavoriteRestaurant favorite = new FavoriteRestaurant();
            favorite.setUser(user);
            favorite.setRestaurant(restaurant);
            favoriteRepo.save(favorite);
        }
    }

    public List<com.user.dto.FavoriteResponseDto> getFavorites(UserEntity user) {
        if (user == null) throw new RuntimeException("User not found");
        List<FavoriteRestaurant> favorites = favoriteRepo.findByUser_Id(user.getId());
        return favorites.stream()
            .map(fav -> new com.user.dto.FavoriteResponseDto(fav.getId(), fav.getRestaurant().getId()))
            .collect(java.util.stream.Collectors.toList());
    }
    
    public boolean isFavorite(UserEntity user, Long restaurantId) {
        if (user == null) return false;
        return favoriteRepo.existsByUser_IdAndRestaurant_Id(user.getId(), restaurantId);
    }
}
