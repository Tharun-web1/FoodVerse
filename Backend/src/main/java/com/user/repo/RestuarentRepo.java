package com.user.repo;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.user.entity.Restuarent;

public interface RestuarentRepo extends JpaRepository<Restuarent, Long> {
	@EntityGraph(attributePaths = {"items"})
    @Query("select u from Restuarent u where u.username=:username")
    Restuarent findByUsername(@Param("username") String username);

    Restuarent findByMail(@Param("mail") String mail);
    Restuarent findByPhnno(@Param("phnno") String phnno);

    @EntityGraph(attributePaths = {"items"})
    java.util.List<Restuarent> findDistinctByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, @Param("description") String description);

    @EntityGraph(attributePaths = {"items"})
    @Query("select r from Restuarent r")
    Page<Restuarent> findAllWithItems(Pageable pageable);

    @EntityGraph(attributePaths = {"items"})
    Optional<Restuarent> findById(@Param("id") Long id);

    long countByActiveAndStatus(boolean active, String status);

    long countByStatus(String status);

    @Query("SELECT r FROM Restuarent r WHERE r.status = :status AND r.active = :active AND (LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.location) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Restuarent> searchByStatusAndActive(@Param("status") String status, @Param("active") boolean active, @Param("search") String search, Pageable pageable);

    @Query("SELECT r FROM Restuarent r WHERE r.status = :status AND (LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.location) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Restuarent> searchByStatus(@Param("status") String status, @Param("search") String search, Pageable pageable);

    Page<Restuarent> findByStatusAndActive(String status, boolean active, Pageable pageable);

    Page<Restuarent> findByStatus(String status, Pageable pageable);

    java.util.List<Restuarent> findByStatus(String status);

    java.util.List<Restuarent> findByActiveFalseAndSuspensionExpiryBefore(java.time.LocalDateTime now);

    @EntityGraph(attributePaths = {"items"})
    @Query("SELECT r FROM Restuarent r WHERE r.active = true AND r.status = 'APPROVED'")
    Page<Restuarent> findActiveWithItems(Pageable pageable);

    @EntityGraph(attributePaths = {"items"})
    @Query("SELECT r FROM Restuarent r WHERE r.active = true AND r.status = 'APPROVED' AND (LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    java.util.List<Restuarent> searchActiveRestaurants(@Param("query") String query);
}

