package com.user.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.user.dto.ItemCategoryResponseDTO;
import com.user.entity.Restuarent;
import com.user.entity.RestuarentItems;
import com.user.repo.RestuarentItemsRepo;
import com.user.repo.RestuarentRepo;


@Service
public class ItemsService {

    @Autowired
    private RestuarentItemsRepo itemsRepo;

    @Autowired
    private RestuarentRepo restRepo;

    public RestuarentItems addItem(String name, RestuarentItems item) {
    	
    	Restuarent restuarentId=restRepo.findByUsername(name);
    
    	
    	if(restuarentId == null)
    	{
    		throw new RuntimeException("Restorent not found"+name);
    	}

        Restuarent restuarent = restRepo.findById(restuarentId.getId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        		item.setRestuarent(restuarent);
        item.setRestuarent(restuarentId); 

        return itemsRepo.save(item);
    }

    public List<RestuarentItems> getItemsByRestaurant(Long restuarentId) {

       Restuarent restuarent = restRepo.findById(restuarentId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        return itemsRepo.findByRestuarent(restuarent);
    }
    public List<ItemCategoryResponseDTO> getItemsByCategory(String category) {
        List<RestuarentItems> items = itemsRepo.findByCategoryIgnoreCase(category);
        List<ItemCategoryResponseDTO> response = new ArrayList<>();
        java.util.Set<String> seen = new java.util.HashSet<>();

        for (RestuarentItems item : items) {
            String key = item.getItemName().toLowerCase().trim() + "|" + item.getRestuarent().getId();
            if (!seen.contains(key)) {
                response.add(new ItemCategoryResponseDTO(
                        item.getId(),
                        item.getItemName(),
                        item.getDescription(),
                        item.getPrice(),
                        item.isAvailable(),
                        item.getCategory(),
                        item.getType(),
                        item.getServes(),
                        item.getRestuarent().getId(),
                        item.getRestuarent().getName(),
                        item.getRestuarent().getRating()
                ));
                seen.add(key);
            }
        }

        return response;
    }
    public List<ItemCategoryResponseDTO> searchItems(String query) {
        List<RestuarentItems> items = itemsRepo.findDistinctByItemNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
        List<ItemCategoryResponseDTO> response = new ArrayList<>();
        java.util.Set<String> seen = new java.util.HashSet<>();

        for (RestuarentItems item : items) {
            String key = item.getItemName().toLowerCase().trim() + "|" + item.getRestuarent().getId();
            if (!seen.contains(key)) {
                response.add(new ItemCategoryResponseDTO(
                        item.getId(),
                        item.getItemName(),
                        item.getDescription(),
                        item.getPrice(),
                        item.isAvailable(),
                        item.getCategory(),
                        item.getType(),
                        item.getServes(),
                        item.getRestuarent().getId(),
                        item.getRestuarent().getName(),
                        item.getRestuarent().getRating()
                ));
                seen.add(key);
            }
        }

        return response;
    }

    public RestuarentItems getItemByIdAndRestaurant(Long itemId, Long restaurantId) {
        RestuarentItems item = itemsRepo.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        
        if (!item.getRestuarent().getId().equals(restaurantId)) {
            throw new RuntimeException("Item does not belong to this restaurant");
        }
        return item;
    }

    public RestuarentItems updateItem(Long itemId, RestuarentItems itemDetails) {
        RestuarentItems item = itemsRepo.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        
        if(itemDetails.getItemName() != null) item.setItemName(itemDetails.getItemName());
        if(itemDetails.getDescription() != null) item.setDescription(itemDetails.getDescription());
        if(itemDetails.getPrice() != 0.0) item.setPrice(itemDetails.getPrice());
        if(itemDetails.getCategory() != null) item.setCategory(itemDetails.getCategory());
        if(itemDetails.getType() != null) item.setType(itemDetails.getType());
        if(itemDetails.getServes() != null) item.setServes(itemDetails.getServes());
        item.setAvailable(itemDetails.isAvailable());

        return itemsRepo.save(item);
    }

    @Autowired
    private com.user.repo.ItemsImageRepo imageRepo;

    @Autowired
    private com.user.repo.OrderItemRepo orderItemRepo;

    @Autowired
    private com.user.repo.ReviewRepo reviewRepo;

    @org.springframework.transaction.annotation.Transactional
    public void deleteItem(Long itemId) {
        RestuarentItems item = itemsRepo.findById(itemId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Item not found"));

        // 1. Check if item has been ordered (cannot delete if it has)
        if (orderItemRepo.existsByItem(item)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, 
                    "Cannot delete item as it has been included in past orders. You can mark it as unavailable instead.");
        }

        // 2. Disconnect reviews (Reviews are nullable in DB)
        reviewRepo.findByItemId(itemId).forEach(review -> {
            review.setItem(null);
            reviewRepo.save(review);
        });

        // 3. Delete associated image
        imageRepo.findByRi(item).ifPresent(image -> imageRepo.delete(image));

        // 4. Remove from parent's collection to avoid re-saving by cascade
        Restuarent restuarent = item.getRestuarent();
        if (restuarent != null && restuarent.getItems() != null) {
            restuarent.getItems().remove(item);
        }

        // 5. Finally delete the item
        itemsRepo.delete(item);
    }


}

