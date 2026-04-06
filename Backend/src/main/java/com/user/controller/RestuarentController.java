package com.user.controller;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.user.dto.ItemCategoryResponseDTO;
import com.user.dto.SearchResponseDTO;
import com.user.entity.LicenceImage;
import com.user.entity.LogoImage;
import com.user.entity.Restuarent;
import com.user.entity.RestuarentImage;
import com.user.entity.RestuarentItems;
import com.user.entity.TinImage;
import com.user.repo.LImageRepo;
import com.user.repo.LicenceRepo;
import com.user.repo.RImageRepo;
import com.user.repo.RestuarentItemsRepo;
import com.user.repo.TImageRepo;
import com.user.service.ItemImageService;
import com.user.service.ItemsService;
import com.user.service.LImageService;
import com.user.service.LicenceService;
import com.user.service.RImageService;
import com.user.service.RestuarentService;
import com.user.service.TImageService;
import com.user.service.ContactService;
import com.user.entity.Contact;
@CrossOrigin(origins =  "*" )
@RestController
@RequestMapping("/restaurants")

public class RestuarentController {

    @Autowired
    private RestuarentService restuarentService;
	@Autowired
	public ItemsService service;
	@Autowired
	public RestuarentItemsRepo rir;

	
	@Autowired
	private LImageRepo lr;
	@Autowired
	private LImageService ls;
	@Autowired
	private TImageRepo tr;
	@Autowired
	private TImageService ts;
	@Autowired
	private LicenceRepo llr;
	@Autowired
	private LicenceService lls;
	@Autowired
	private RImageRepo imageRepo;

	@Autowired
	private ItemImageService iis;
    
    @Autowired
    private ContactService contactService;

    @PostMapping("/contactform")
	public String contactform(@RequestBody Contact contact) {
		contactService.Contactform(contact);
		return "add-success";
	}

    @PostMapping("/add")
    public Restuarent addRestuarent(@RequestBody Restuarent restuarent) {
        return restuarentService.addRestuarent(restuarent);
    }

    @GetMapping
    public List<Restuarent> getAllRestuarents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return restuarentService.getRestaurantsPaginated(page, size);
    }

    @GetMapping("/{id}")
    public Restuarent getRestuarent(@PathVariable("id") Long id) {
        Restuarent res = restuarentService.getRestuarentById(id);
        if (!res.isActive() || !"APPROVED".equals(res.getStatus())) {
            throw new RuntimeException("Restaurant is currently unavailable");
        }
        return res;
    }
    @Autowired
    private RImageService imageService;


    // UPLOAD RESTAURANT IMAGE
    @PostMapping("/{id}/image")
    public ResponseEntity<String> uploadImage(
            @PathVariable("id") Long id,
            @RequestParam("image") MultipartFile image) throws IOException {

        String response = imageService.uploadRestaurantImage(image, id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<Resource> getImage(@PathVariable("id") Long id)
            throws MalformedURLException {

        Resource resource = imageService.getRestaurantImage(id);
        
        // Find metadata to get correct content type
        Restuarent res = restuarentService.getRestuarentById(id);
        String contentType = imageRepo.findByRestaurant(res)
                .map(RestuarentImage::getImage_type)
                .orElse("image/jpeg");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(resource);
    }
	@PostMapping("/tindoc/{id}")
	public ResponseEntity<String>add(@RequestParam("image")MultipartFile image,@PathVariable("id") Long id)throws IOException{
		ts.postImage(image, id);
		return ResponseEntity.ok("image uploaded successfully.......");
	}
	@GetMapping("/tindoc/{id}")
	public ResponseEntity<Resource> getImg(@PathVariable("id") Long id) throws MalformedURLException {
		Resource a = ts.getImageByRestaurantId(id);
		TinImage i = tr.findByRestaurant(restuarentService.getRestuarentById(id)).orElseThrow();
		String t = i.getImage_type();
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "inline")
				.header(HttpHeaders.CONTENT_TYPE, t)
				.body(a);
	}

	@PostMapping("/licencedoc/{id}")
	public ResponseEntity<String>adimg(@RequestParam("image")MultipartFile image,@PathVariable("id") Long id)throws IOException{
		lls.postImage(image, id);
		return ResponseEntity.ok("image uploaded successfully.......");
	}
	@GetMapping("/licencedoc/{id}")
	public ResponseEntity<Resource> getLImage(@PathVariable("id") Long id) throws MalformedURLException {
		Resource a = lls.getImageByRestaurantId(id);
		LicenceImage i = llr.findByRestaurant(restuarentService.getRestuarentById(id)).orElseThrow();
		String t = i.getImage_type();
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "inline")
				.header(HttpHeaders.CONTENT_TYPE, t)
				.body(a);
	}
	@PostMapping("/logoimage/{id}")
	public ResponseEntity<String>addimg(@RequestParam("image")MultipartFile image,@PathVariable("id") Long id)throws IOException
	{
		ls.postImage(image,id);
		return ResponseEntity.ok("image uploaded successfully.........");
	}
	@GetMapping("/logoimage/{id}")
	public ResponseEntity<Resource> getimg(@PathVariable("id") Long id) throws MalformedURLException {
		Resource a = ls.getImageByRestaurantId(id);
		LogoImage i = lr.findByRestaurant(restuarentService.getRestuarentById(id)).orElseThrow();
		String t = i.getImage_type();
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "inline")
				.header(HttpHeaders.CONTENT_TYPE, t)
				.body(a);
	}
	
	
	
	
	
	
	
	
	@PostMapping("/itemimg/{id}")
	public ResponseEntity<String>addItem(@RequestParam("image")MultipartFile image,@PathVariable("id") Long id)throws IOException
	{
		iis.postImage(image, id);
		return ResponseEntity.ok("item image added successfully....");
	}
	@GetMapping("/{itemId}/itemimg")
	public ResponseEntity<Resource> getItemImage(@PathVariable("itemId") Long itemId)
	        throws MalformedURLException {

	    Resource resource = iis.getImage(itemId);

	    return ResponseEntity.ok()
	            .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
	            .contentType(MediaType.IMAGE_JPEG)
	            .body(resource);
	}

	@PostMapping("/additem")
    public ResponseEntity<RestuarentItems> addItem(
            @RequestBody RestuarentItems item
    ) {
		
		String username=SecurityContextHolder.getContext().getAuthentication().getName();
		if(username.equals("anonymousUser") )
		{
			throw new RuntimeException("anonymousUser");
		}
        RestuarentItems savedItem = service.addItem(username, item);
        return ResponseEntity.ok(savedItem);
    }
    @GetMapping("/{id}/items")
    public List<RestuarentItems> getItemsByRestaurant(@PathVariable("id") Long id) {
        return service.getItemsByRestaurant(id);
    }
    @GetMapping("/category/{category}")
    public List<ItemCategoryResponseDTO> getItemsByCategory(
            @PathVariable("category") String category) {

        return service.getItemsByCategory(category);
    }

    @GetMapping("/search")
    public SearchResponseDTO search(@RequestParam("query") String query) {
        List<Restuarent> restaurants = restuarentService.searchRestaurants(query);
        List<ItemCategoryResponseDTO> dishes = service.searchItems(query);
        return new SearchResponseDTO(restaurants, dishes);
    }

    //RESTAURANT DASHBOARD LOGIC

    @GetMapping("/profile")
    public Restuarent getMyProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Restuarent res = restuarentService.getRestuarentByUsername(username);
        if (res == null) throw new RuntimeException("Restaurant profile not found for user: " + username);
        return res;
    }

    @PutMapping("/profile")
    public Restuarent updateMyProfile(@RequestBody Restuarent restuarent) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Restuarent current = restuarentService.getRestuarentByUsername(username);
        if (current == null) throw new RuntimeException("Restaurant profile not found for user: " + username);
        return restuarentService.updateRestuarent(current.getId(), restuarent);
    }

    @GetMapping("/my-items")
    public List<RestuarentItems> getMyItems() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Restuarent current = restuarentService.getRestuarentByUsername(username);
        if (current == null) throw new RuntimeException("Restaurant profile not found for user: " + username);
        return current.getItems();
    }

    @GetMapping("/my-items/{itemId}")
    public RestuarentItems getMyItem(@PathVariable("itemId") Long itemId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Restuarent current = restuarentService.getRestuarentByUsername(username);
        if (current == null) throw new RuntimeException("Restaurant profile not found for user: " + username);
        return service.getItemByIdAndRestaurant(itemId, current.getId());
    }

    @PutMapping("/my-items/{itemId}")
    public RestuarentItems updateItem(@PathVariable("itemId") Long itemId, @RequestBody RestuarentItems itemDetails) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Restuarent current = restuarentService.getRestuarentByUsername(username);
        if (current == null) throw new RuntimeException("Restaurant profile not found for user: " + username);
        // Ensure item ownership check logic is inside service or checked here
        service.getItemByIdAndRestaurant(itemId, current.getId()); 
        return service.updateItem(itemId, itemDetails);
    }

    @DeleteMapping("/my-items/{itemId}")
    public ResponseEntity<String> deleteItem(@PathVariable("itemId") Long itemId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Restuarent current = restuarentService.getRestuarentByUsername(username);
        if (current == null) throw new RuntimeException("Restaurant profile not found for user: " + username);
        // Ensure item ownership
        service.getItemByIdAndRestaurant(itemId, current.getId());
        
        service.deleteItem(itemId);
        return ResponseEntity.ok("Item deleted successfully");
    }
}

