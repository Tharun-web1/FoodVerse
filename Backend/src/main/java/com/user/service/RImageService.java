package com.user.service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.user.entity.Restuarent;
import com.user.entity.RestuarentImage;
import com.user.repo.RImageRepo;
import com.user.repo.RestuarentRepo;

@Service
public class RImageService {

    // Folder where images are stored
    private final String IMAGE_DIR = "images/RImages";

    @Autowired
    private RImageRepo imageRepo;

    @Autowired
    private RestuarentRepo restaurantRepo;

    /* =========================
       UPLOAD IMAGE
       ========================= */
    public String uploadRestaurantImage(MultipartFile image, Long restaurantId) {

        try {
            // 1. Create directory if not exists
            Path uploadPath = Paths.get(IMAGE_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 2. Generate unique filename
            String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);

            // 3. Save file to disk
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 4. Fetch restaurant
            Restuarent restaurant = restaurantRepo.findById(restaurantId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Restaurant not found with id: " + restaurantId
                    ));

            // 5. Save image metadata (Check if already exists)
            RestuarentImage restaurantImage = imageRepo.findByRestaurant(restaurant)
                    .orElse(new RestuarentImage());

            restaurantImage.setRestaurant(restaurant);
            restaurantImage.setImage_name(fileName);
            restaurantImage.setImage_path(filePath.toString());
            restaurantImage.setImage_type(image.getContentType());

            imageRepo.save(restaurantImage);

            return "Restaurant image uploaded successfully";

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not upload image",
                    e
            );
        }
    }

    /* =========================
       GET IMAGE BY RESTAURANT ID
       ========================= */
    public Resource getRestaurantImage(Long restaurantId) {

        try {
            // 1. Get restaurant
            Restuarent restaurant = restaurantRepo.findById(restaurantId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Restaurant not found"
                    ));

            // 2. Get image mapped to restaurant
            RestuarentImage image = imageRepo.findByRestaurant(restaurant)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Image not found for this restaurant"
                    ));

            // 3. Load image from disk
            Path imagePath = Paths.get(image.getImage_path());
            Resource resource = new UrlResource(imagePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Image file not found"
                );
            }

            return resource;

        } catch (MalformedURLException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error loading image",
                    e
            );
        }
    }

}
