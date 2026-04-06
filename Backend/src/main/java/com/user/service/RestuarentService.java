package com.user.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.user.entity.Restuarent;
import com.user.repo.RestuarentRepo;


@Service
public class RestuarentService {

    @Autowired
    private RestuarentRepo restuarentRepository;

    
    public Restuarent addRestuarent(Restuarent restuarent) {
        if (restuarent.getRating() == null) restuarent.setRating(0.0);
        if (restuarent.getReview() == null) restuarent.setReview(0);
        return restuarentRepository.save(restuarent);
    }
    public List<Restuarent> getAllRestuarents() {
        return restuarentRepository.findAll();
    }
    
    public Restuarent getRestuarentByUsername(String username) {
        return restuarentRepository.findByUsername(username);
    }

    public List<Restuarent> getRestaurantsPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return restuarentRepository.findActiveWithItems(pageable).getContent();
    }
    
    public Restuarent getRestuarentById(Long id) {
        return restuarentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
    }

    public List<Restuarent> searchRestaurants(String query) {
        return restuarentRepository.searchActiveRestaurants(query);
    }

    public Restuarent updateRestuarent(Long id, Restuarent restuarent) {
        Restuarent existing = getRestuarentById(id);

        if (restuarent.getName() != null) existing.setName(restuarent.getName());
        if (restuarent.getLocation() != null) existing.setLocation(restuarent.getLocation());
        if (restuarent.getR_min() != null) existing.setR_min(restuarent.getR_min());
        if (restuarent.getR_max() != null) existing.setR_max(restuarent.getR_max());
        if (restuarent.getR_cuisine() != null) existing.setR_cuisine(restuarent.getR_cuisine());
        if (restuarent.getR_zone() != null) existing.setR_zone(restuarent.getR_zone());
        if (restuarent.getR_lat() != null) existing.setR_lat(restuarent.getR_lat());
        if (restuarent.getR_lon() != null) existing.setR_lon(restuarent.getR_lon());
        if (restuarent.getR_fName() != null) existing.setR_fName(restuarent.getR_fName());
        if (restuarent.getR_lName() != null) existing.setR_lName(restuarent.getR_lName());
        if (restuarent.getPhnno() != null) existing.setPhnno(restuarent.getPhnno());
        if (restuarent.getR_tin() != null) existing.setR_tin(restuarent.getR_tin());
        if (restuarent.getR_exp() != null) existing.setR_exp(restuarent.getR_exp());
        if (restuarent.getR_llNo() != null) existing.setR_llNo(restuarent.getR_llNo());
        if (restuarent.getR_llExp() != null) existing.setR_llExp(restuarent.getR_llExp());
        

        return restuarentRepository.save(existing);
    }

    public List<Restuarent> getByStatus(String status) {
        return restuarentRepository.findByStatus(status);
    }

    public Restuarent approveRestaurant(Long id) {
        Restuarent res = getRestuarentById(id);
        res.setStatus("APPROVED");
        res.setActive(true);
        return restuarentRepository.save(res);
    }

    public Restuarent blockRestaurant(Long id) {
        Restuarent res = getRestuarentById(id);
        res.setStatus("BLOCKED");
        res.setActive(false);
        return restuarentRepository.save(res);
    }

    public Restuarent updateStatus(Long id, boolean active, Integer hours) {
        Restuarent res = getRestuarentById(id);
        res.setActive(active);
        if (!active && hours != null && hours > 0) {
            res.setSuspensionExpiry(java.time.LocalDateTime.now().plusHours(hours));
        } else {
            res.setSuspensionExpiry(null);
        }
        return restuarentRepository.save(res);
    }

    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 60000)
    public void processExpirations() {
        java.util.List<Restuarent> expired = restuarentRepository.findByActiveFalseAndSuspensionExpiryBefore(java.time.LocalDateTime.now());
        if (!expired.isEmpty()) {
            System.out.println("Processing " + expired.size() + " expired suspensions...");
            expired.forEach(r -> {
                r.setActive(true);
                r.setSuspensionExpiry(null);
                restuarentRepository.save(r);
                System.out.println("Released restaurant: " + r.getName());
            });
        }
    }

    public void deleteRestaurant(Long id) {
        Restuarent res = getRestuarentById(id);
        restuarentRepository.delete(res);
    }
}
