package com.ems.dto.booking;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

public class BatchBookingRequest {

    @Valid
    @NotEmpty(message = "At least one booking item is required")
    @Size(max = 20, message = "A maximum of 20 bookings can be created at once")
    private List<BookingRequest> items = new ArrayList<>();

    public List<BookingRequest> getItems() {
        return items;
    }

    public void setItems(List<BookingRequest> items) {
        this.items = items;
    }
}
