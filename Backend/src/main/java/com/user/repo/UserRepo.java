package com.user.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import com.user.enums.Role;
import com.user.entity.UserEntity;

public interface UserRepo extends JpaRepository<UserEntity, Long> {
    @Query("select u from UserEntity u where u.username=:username")
    UserEntity findByUsername(@Param("username") String username);
    
    UserEntity findByMail(@Param("mail") String mail);
    UserEntity findByPhnno(@Param("phnno") String phnno);

    long countByRole(Role role);

    long countByRoleAndActive(Role role, boolean active);

    Page<UserEntity> findByRole(Role role, Pageable pageable);

    @Query("SELECT u FROM UserEntity u WHERE u.role = :role AND (LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.mail) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<UserEntity> searchByRole(@Param("role") Role role, @Param("search") String search, Pageable pageable);

    List<UserEntity> findByRole(Role role);
}
