package com.user.controller;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.List;
import java.time.LocalDateTime;
import org.springframework.format.annotation.DateTimeFormat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.user.dto.PartnerLoginDto;
import com.user.entity.AdhaarImage;
import com.user.entity.BikeLicenceImage;
import com.user.entity.PanImage;
import com.user.entity.RiderEntity;
import com.user.entity.UserImage;
import com.user.repo.AdhaarRepo;
import com.user.repo.BLicenceRepo;
import com.user.repo.PanRepo;
import com.user.repo.UserImgRepo;
import com.user.service.RiderService;
import com.user.service.UserImgService;
import com.user.service.AdhaarService;
import com.user.service.BLicenceService;
import com.user.service.JwtService;
import com.user.service.PanService;

@RestController
@RequestMapping("/partner/auth")
@CrossOrigin("*")
public class DeliveryPartnerController {

    @Autowired
    private RiderService service;

    @Autowired
    private JwtService jwtService;
    @Autowired
    private AdhaarRepo adhaar;
    @Autowired
    private AdhaarService ads;

    @Autowired
    private BLicenceService as;
    @Autowired
    private BLicenceRepo ar;
    @Autowired
    private UserImgRepo ur;
    @Autowired
    private UserImgService us;
    
    @Autowired
    private PanService ps;
    @Autowired
    private PanRepo pr;

    // 📝 Register Partner
    @PostMapping("/register")
    public RiderEntity register(
            @RequestBody RiderEntity dp) {

        return service.registerPartner(dp);
    }

    // 🔐 Login → Returns JWT Token
    @PostMapping("/login")
    public String login(
            @RequestBody PartnerLoginDto dto) {

        RiderEntity partner = service.login(
                dto.getEmail(),
                dto.getPassword());

        // Generate JWT token
        return jwtService.generateToken(
                partner.getEmail(), null);
    }

    // 📋 Get All Partners (Admin)
    @GetMapping("/all")
    public List<RiderEntity> getAllPartners() {
        return service.getAllPartners();
    }

    // ✅ Approve Partner (Admin)
    @PutMapping("/approve/{id}")
    public RiderEntity approvePartner(
            @PathVariable("id") Integer id) {

        return service.approvePartner(id);
    }

    // 🚫 Block Partner
    @PutMapping("/block/{id}")
    public RiderEntity blockPartner(
            @PathVariable("id") Integer id,
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(value = "until", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime until) {

        return service.blockPartner(id, from, until);
    }

    // 🟢 Toggle Availability (Online / Offline)
    @PutMapping("/availability/{id}")
    public RiderEntity updateAvailability(
            @PathVariable("id") Integer id,
            @RequestParam("available") Boolean available) {

        return service.updateAvailability(id,
                available);
    }

    @PostMapping("/BikeLicence/{id}")
    public ResponseEntity<String> add(@RequestParam("image") MultipartFile image, @PathVariable("id") Integer id)
            throws IOException {
        as.postImage(image, id);
        return ResponseEntity.ok("image uploaded successfully.......");
    }
    @GetMapping("/BikeLicence/{id}")
    public ResponseEntity<Resource> getImg(@PathVariable("id") int id) throws MalformedURLException {
        Resource a = as.getImage(id);
        RiderEntity r = service.getRiderById(id);
        BikeLicenceImage i = ar.findByRd(r).orElseThrow(() -> new RuntimeException("License image not found for rider: " + id));

        String t = i.getImage_type();
        return ResponseEntity.status(HttpStatus.OK).header(HttpHeaders.CONTENT_TYPE, t).body(a);
    }


    @PostMapping("/userimg/{id}")
    public ResponseEntity<String> addIMg(@RequestParam("image") MultipartFile image, @PathVariable("id") Integer id)
            throws IOException {
        us.postImage(image, id);
        return ResponseEntity.ok("image uploaded successfully.......");
    }
    
    @GetMapping("/userimg/{id}")
    public ResponseEntity<Resource> getImag(@PathVariable("id") int id) throws MalformedURLException {
        Resource a = us.getImage(id);
        RiderEntity r = service.getRiderById(id);
        UserImage i = ur.findByRd(r).orElseThrow(() -> new RuntimeException("User image not found for rider: " + id));

        String t = i.getImage_type();
        return ResponseEntity.status(HttpStatus.OK).header(HttpHeaders.CONTENT_TYPE, t).body(a);
    }

    @PostMapping("/pan/{id}")
    public ResponseEntity<String> ad(@RequestParam("image") MultipartFile image, @PathVariable("id") Integer id)
            throws IOException {
        ps.postImage(image, id);
        return ResponseEntity.ok("image uploaded successfully.......");
    }

    @GetMapping("/pan/{id}")
    public ResponseEntity<Resource> getImage(@PathVariable("id") int id) throws MalformedURLException {
        Resource a = ps.getImage(id);
        RiderEntity r = service.getRiderById(id);
        PanImage i = pr.findByRd(r).orElseThrow(() -> new RuntimeException("PAN image not found for rider: " + id));

        String t = i.getImage_type();
        return ResponseEntity.status(HttpStatus.OK).header(HttpHeaders.CONTENT_TYPE, t).body(a);
    }
    
    @PostMapping("/adhaar/{id}")
    public ResponseEntity<String> addImge(@RequestParam("image") MultipartFile image, @PathVariable("id") Integer id)
            throws IOException {
        ads.postImage(image, id);
        return ResponseEntity.ok("image uploaded successfully.......");
    }

    @GetMapping("/adhaar/{id}")
    public ResponseEntity<Resource> getImge(@PathVariable("id") int id) throws MalformedURLException {

        Resource a = ads.getImage(id);
        RiderEntity r = service.getRiderById(id);
        AdhaarImage i = adhaar.findByRd(r).orElseThrow(() -> new RuntimeException("Aadhaar image not found for rider: " + id));

        String t = i.getImage_type();
        return ResponseEntity.status(HttpStatus.OK).header(HttpHeaders.CONTENT_TYPE, t).body(a);
    }

    // 📍 Update Live Location
    @PutMapping("/location")
    public RiderEntity updateLocation(
            @RequestHeader("Authorization") String token,
            @RequestParam("lat") Double lat,
            @RequestParam("lng") Double lng) {

        String jwt = token.substring(7);
        String username = jwtService.extractUsername(jwt);
        return service.updateLocation(username, lat, lng);
    }
}
