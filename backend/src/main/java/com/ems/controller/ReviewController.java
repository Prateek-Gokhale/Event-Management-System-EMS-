package com.ems.controller;

import com.ems.dto.review.ReviewRequest;
import com.ems.dto.review.ReviewResponse;
import com.ems.entity.Event;
import com.ems.entity.Review;
import com.ems.entity.User;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EventRepository;
import com.ems.repository.BookingRepository;
import com.ems.repository.ReviewRepository;
import com.ems.repository.UserRepository;
import com.ems.entity.enums.BookingStatus;
import com.ems.exception.BadRequestException;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events/{eventId}/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;

    public ReviewController(ReviewRepository reviewRepository, UserRepository userRepository, EventRepository eventRepository, BookingRepository bookingRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getReviews(@PathVariable Long eventId) {
        return ResponseEntity.ok(reviewRepository.findByEventIdOrderByCreatedAtDesc(eventId)
                .stream()
                .map(this::mapReview)
                .toList());
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> saveReview(
            @PathVariable Long eventId,
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        if (!bookingRepository.existsByUserIdAndEventIdAndStatus(user.getId(), eventId, BookingStatus.BOOKED)) {
            throw new BadRequestException("Only users with accepted bookings can review this event");
        }
        Review review = reviewRepository.findByUserEmailAndEventId(authentication.getName(), eventId)
                .orElseGet(Review::new);
        review.setUser(user);
        review.setEvent(event);
        review.setRating(request.getRating());
        review.setComment(request.getComment() == null ? null : request.getComment().trim());
        review.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.ok(mapReview(reviewRepository.save(review)));
    }

    private ReviewResponse mapReview(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setEventId(review.getEvent().getId());
        response.setUserName(review.getUser().getName());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());
        return response;
    }
}
