package com.user.dto;

import java.time.LocalDateTime;

public class ReviewResponseDto {
    private Long id;
    private Long userId;
    private String username;
    private String profileImageUrl;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;

    public ReviewResponseDto() {}

    public ReviewResponseDto(Long id, Long userId, String username, String profileImageUrl, int rating, String comment, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.profileImageUrl = profileImageUrl;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
