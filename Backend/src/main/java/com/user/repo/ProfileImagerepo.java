package com.user.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import com.user.entity.ProfileImage;

public interface ProfileImagerepo extends JpaRepository<ProfileImage, Long> {
    ProfileImage findByUe_Id(@Param("userId") Long userId);
    void deleteByUe_Id(@Param("userId") Long userId);
}
