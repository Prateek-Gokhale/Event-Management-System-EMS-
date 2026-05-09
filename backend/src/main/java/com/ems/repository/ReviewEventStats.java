package com.ems.repository;

public interface ReviewEventStats {
    Long getEventId();

    Double getAverageRating();

    Long getReviewCount();
}
