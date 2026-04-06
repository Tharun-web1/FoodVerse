package com.user.service;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.user.entity.ProfileImage;
import com.user.entity.UserEntity;
import com.user.repo.ProfileImagerepo;

@Service
public class ProfileImageService {

    private final String DIR = "images/profileimages/";

    @Autowired
    private ProfileImagerepo profileImageRepo;


    /** UPLOAD / REPLACE PROFILE IMAGE **/
    public void updateProfileImage(MultipartFile image, UserEntity user) throws Exception {
        if (user == null) throw new RuntimeException("User not found");

        Path uploadPath = Paths.get(DIR);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        // Delete old image if exists
        ProfileImage existing = profileImageRepo.findByUe_Id(user.getId());
        if (existing != null) {
            Files.deleteIfExists(Paths.get(existing.getPpath()));
            profileImageRepo.delete(existing);
        }

        String filename = System.currentTimeMillis() + "_" + image.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);

        Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        ProfileImage profileImage = new ProfileImage();
        profileImage.setPname(filename);
        profileImage.setPpath(filePath.toString());
        profileImage.setPtype(image.getContentType());
        profileImage.setUe(user);

        profileImageRepo.save(profileImage);
    }

    /** GET PROFILE IMAGE **/
    public Resource getProfileImage(UserEntity user) throws MalformedURLException {
        if (user == null) throw new RuntimeException("User not found");

        ProfileImage image = profileImageRepo.findByUe_Id(user.getId());

        // If no image, return default
        Path imagePath;
        if (image != null) {
            imagePath = Paths.get(image.getPpath());
        } else {
            imagePath = Paths.get("images/default-profile.png"); // default image
        }

        return new UrlResource(imagePath.toUri());
    }

    /** DELETE PROFILE IMAGE **/
    public void deleteProfileImage(UserEntity user) throws Exception {
        if (user == null) throw new RuntimeException("User not found");

        ProfileImage image = profileImageRepo.findByUe_Id(user.getId());
        if (image != null) {
            Files.deleteIfExists(Paths.get(image.getPpath()));
            profileImageRepo.delete(image);
        }
    }

    /** GET PROFILE IMAGE BY USER ID (PUBLIC) **/
    public Resource getProfileImageByUserId(Long userId) throws MalformedURLException {
        ProfileImage image = profileImageRepo.findByUe_Id(userId);
        
        // If no image, return default
        Path imagePath;
        if (image != null) {
            imagePath = Paths.get(image.getPpath());
        } else {
            imagePath = Paths.get("images/default-profile.png"); // default image
        }
        
        return new UrlResource(imagePath.toUri());
    }
}
