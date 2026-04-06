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
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.user.entity.ItemsImage;
import com.user.entity.RestuarentItems;
import com.user.repo.ItemsImageRepo;
import com.user.repo.RestuarentItemsRepo;

@Service
public class ItemImageService {
	String dir = "images/items/";

	@Autowired
	private ItemsImageRepo itemrepo;
	@Autowired
	private RestuarentItemsRepo rir;

	public String postImage(MultipartFile image, Long id) throws IOException {
		Path uploadpath = Paths.get(dir);
		if (!Files.exists(uploadpath)) {
			Files.createDirectories(uploadpath);
		}
		String iname = image.getOriginalFilename();
		Path ipath = uploadpath.resolve(iname);

		Files.copy(image.getInputStream(), ipath, StandardCopyOption.REPLACE_EXISTING);
		RestuarentItems ri = rir.findById(id).orElseThrow();
		ItemsImage i = itemrepo.findByRi(ri).orElse(new ItemsImage());
		i.setRi(ri);
		i.setImage_name(iname);
		i.setImage_path(ipath.toString());
		i.setImage_type(image.getContentType());
		itemrepo.save(i);
		return "Success....";
	}

	public Resource getImage(long itemId) throws MalformedURLException {

		RestuarentItems item = rir.findById(itemId)
				.orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
						org.springframework.http.HttpStatus.NOT_FOUND, "Item not found"));

		ItemsImage image = itemrepo.findByRi(item)
				.orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
						org.springframework.http.HttpStatus.NOT_FOUND, "Image not found for item"));

		Path path = Paths.get(image.getImage_path());
		return new UrlResource(path.toUri());
	}
}
