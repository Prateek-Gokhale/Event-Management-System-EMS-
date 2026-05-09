package com.ems.repository;

public interface BookingEventStats {
    Long getEventId();

    Long getBookedSeats();

    Long getReservedSeats();
}
