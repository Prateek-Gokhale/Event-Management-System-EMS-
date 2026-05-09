package com.ems.controller;

import com.ems.dto.admin.AdminAnalyticsResponse;
import com.ems.dto.auth.UserSummaryResponse;
import com.ems.dto.booking.BookingResponse;
import com.ems.dto.booking.BookingStatusUpdateRequest;
import com.ems.service.AdminService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserSummaryResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }

    @GetMapping("/analytics")
    public ResponseEntity<AdminAnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(adminService.getAnalytics());
    }

    @PutMapping("/bookings/{bookingId}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long bookingId,
            @Valid @RequestBody BookingStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(adminService.updateBookingStatus(bookingId, request));
    }

    @PutMapping("/bookings/{bookingId}/check-in")
    public ResponseEntity<BookingResponse> checkInBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(adminService.checkInBooking(bookingId));
    }

}
