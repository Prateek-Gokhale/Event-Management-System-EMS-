package com.ems.service;

import com.ems.dto.booking.BookingRequest;
import com.ems.dto.booking.BookingResponse;
import java.util.List;

public interface BookingService {
    BookingResponse createBooking(String currentUserEmail, BookingRequest request);
    List<BookingResponse> createBookings(String currentUserEmail, List<BookingRequest> requests);
    List<BookingResponse> getUserBookings(Long userId);
    List<BookingResponse> getCurrentUserBookings(String currentUserEmail);
    BookingResponse checkInBooking(Long bookingId);
}
