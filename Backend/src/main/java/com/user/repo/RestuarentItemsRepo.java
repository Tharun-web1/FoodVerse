package com.user.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.query.Param;

import org.springframework.data.jpa.repository.JpaRepository;

import com.user.entity.Restuarent;
import com.user.entity.RestuarentItems;



public interface RestuarentItemsRepo extends JpaRepository<RestuarentItems, Long> {
	
	List<RestuarentItems> findByRestuarent(Restuarent restuarent);
	Optional<RestuarentItems> findById(@Param("itemId") Long itemId);
	List<RestuarentItems> findByCategoryIgnoreCase(@Param("category") String category);
	List<RestuarentItems> findDistinctByItemNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String itemName, @Param("description") String description);
}
