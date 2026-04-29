package com.ems.dto.booking;

import jakarta.validation.constraints.NotNull;

public class BookingRequest {

    @NotNull(message = "Event id is required")
    private Long eventId;

    private String couponCode;
    private String paymentMethod = "MOCK_CARD";

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
