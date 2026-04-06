package com.user.dto;

public class AdminStatsDto {
    private long totalUsers;
    private long activeUsers;
    private long totalRiders;
    private long activeRiders;
    private long totalRestaurants;
    private long activeRestaurants;
    private long inactiveRestaurants;
    private long totalOrders;
    private double totalRevenue;

    public AdminStatsDto() {}

    public AdminStatsDto(long totalUsers, long activeUsers, long totalRiders, long activeRiders, 
                         long totalRestaurants, long activeRestaurants, long inactiveRestaurants,
                         long totalOrders, double totalRevenue) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.totalRiders = totalRiders;
        this.activeRiders = activeRiders;
        this.totalRestaurants = totalRestaurants;
        this.activeRestaurants = activeRestaurants;
        this.inactiveRestaurants = inactiveRestaurants;
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue;
    }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }

    public long getTotalRiders() { return totalRiders; }
    public void setTotalRiders(long totalRiders) { this.totalRiders = totalRiders; }

    public long getActiveRiders() { return activeRiders; }
    public void setActiveRiders(long activeRiders) { this.activeRiders = activeRiders; }

    public long getTotalRestaurants() { return totalRestaurants; }
    public void setTotalRestaurants(long totalRestaurants) { this.totalRestaurants = totalRestaurants; }

    public long getActiveRestaurants() { return activeRestaurants; }
    public void setActiveRestaurants(long activeRestaurants) { this.activeRestaurants = activeRestaurants; }

    public long getInactiveRestaurants() { return inactiveRestaurants; }
    public void setInactiveRestaurants(long inactiveRestaurants) { this.inactiveRestaurants = inactiveRestaurants; }

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
}
