package com.ems.controller;

import com.ems.dto.booking.BookingRequest;
import com.ems.dto.booking.BookingResponse;
import com.ems.entity.User;
import com.ems.entity.enums.Role;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.UserRepository;
import com.ems.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    public BookingController(BookingService bookingService, UserRepository userRepository) {
        this.bookingService = bookingService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(email, request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getCurrentUserBookings(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(bookingService.getCurrentUserBookings(email));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponse>> getUserBookings(@PathVariable Long userId, Authentication authentication) {
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isOwner = currentUser.getId().equals(userId);
        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("You are not allowed to access these bookings");
        }

        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

}
