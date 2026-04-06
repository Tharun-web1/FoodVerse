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

import com.user.entity.LicenceImage;
import com.user.entity.Restuarent;
import com.user.repo.LicenceRepo;
import com.user.repo.RestuarentRepo;


@Service
public class LicenceService {
	
	String dir="images/Licencedoc/";
	@Autowired
	private LicenceRepo lr;
	
	@Autowired
	private RestuarentRepo rr;
	
	public String postImage(MultipartFile image,Long id)throws IOException
	{
		Path uploadpath=Paths.get(dir);
		
		if(!Files.exists(uploadpath))
		{
			Files.createDirectories(uploadpath);
		}
		String iname=image.getOriginalFilename();
		Path ipath=uploadpath.resolve(iname);
		
		Files.copy(image.getInputStream(), ipath, StandardCopyOption.REPLACE_EXISTING);
		Restuarent r=rr.findById(id).orElseThrow();
		LicenceImage i=lr.findByRestaurant(r).orElse(new LicenceImage());
		i.setRestaurant(r);
		i.setImage_name(iname);
		i.setImage_path(ipath.toString());
		i.setImage_type(image.getContentType());
		lr.save(i);
		return "Success....";
	}
	public Resource getImageByRestaurantId(Long restaurantId) throws MalformedURLException {
		Restuarent r = rr.findById(restaurantId)
				.orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
						org.springframework.http.HttpStatus.NOT_FOUND, "Restaurant not found"));
		LicenceImage i = lr.findByRestaurant(r)
				.orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
						org.springframework.http.HttpStatus.NOT_FOUND, "Licence image not found"));
		Path p = Paths.get(i.getImage_path());
		return new UrlResource(p.toUri());
	}

	public Resource getLImage(int id) throws MalformedURLException {
		LicenceImage i = lr.findById(id)
				.orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
						org.springframework.http.HttpStatus.NOT_FOUND, "Licence image not found"));
		Path p = Paths.get(i.getImage_path());
		return new UrlResource(p.toUri());
	}

}

