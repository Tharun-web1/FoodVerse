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

import com.user.entity.PanImage;
import com.user.entity.RiderEntity;
import com.user.repo.PanRepo;
import com.user.repo.RiderRepo;


@Service
public class PanService {
	
	String dir = "PanDoc/";
	@Autowired
	private PanRepo pr;

	@Autowired
	private RiderRepo rr;

	public String postImage(MultipartFile image, Integer id) throws IOException {
		Path uploadpath = Paths.get(dir);

		if (!Files.exists(uploadpath)) {
			Files.createDirectories(uploadpath);
		}
		String iname = image.getOriginalFilename();
		Path ipath = uploadpath.resolve(iname);

		Files.copy(image.getInputStream(), ipath, StandardCopyOption.REPLACE_EXISTING);
		RiderEntity r = rr.findById(id).orElseThrow();
		PanImage i = pr.findByRd(r).orElse(new PanImage());
		i.setRd(r);
		i.setImage_name(iname);
		i.setImage_path(ipath.toString());
		i.setImage_type(image.getContentType());
		pr.save(i);
		return "Success....";
	}

	public Resource getImage(int riderId) throws MalformedURLException {
		RiderEntity r = rr.findById(riderId).orElseThrow();
		PanImage i = pr.findByRd(r).orElseThrow();
		Path p = Paths.get(i.getImage_path());
		Resource res = new UrlResource(p.toUri());
		return res;
	}

}
