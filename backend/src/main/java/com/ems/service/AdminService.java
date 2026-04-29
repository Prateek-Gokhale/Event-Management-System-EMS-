package com.ems.service;

import com.ems.dto.auth.UserSummaryResponse;
import com.ems.dto.admin.AdminAnalyticsResponse;
import com.ems.dto.booking.BookingResponse;
import com.ems.dto.booking.BookingStatusUpdateRequest;
import java.util.List;

public interface AdminService {
    List<UserSummaryResponse> getAllUsers();
    List<BookingResponse> getAllBookings();
    BookingResponse updateBookingStatus(Long bookingId, BookingStatusUpdateRequest request);
    BookingResponse checkInBooking(Long bookingId);
    AdminAnalyticsResponse getAnalytics();
}
