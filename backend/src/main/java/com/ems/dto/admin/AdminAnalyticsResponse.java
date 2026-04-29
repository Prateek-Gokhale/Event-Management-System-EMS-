package com.ems.dto.admin;

import java.math.BigDecimal;
import java.util.Map;

public class AdminAnalyticsResponse {
    private long totalUsers;
    private long totalEvents;
    private long totalBookings;
    private BigDecimal revenue;
    private Map<String, Long> popularCategories;

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(long totalEvents) {
        this.totalEvents = totalEvents;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }

    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }

    public Map<String, Long> getPopularCategories() {
        return popularCategories;
    }

    public void setPopularCategories(Map<String, Long> popularCategories) {
        this.popularCategories = popularCategories;
    }
}
