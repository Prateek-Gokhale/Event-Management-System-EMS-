package com.ems.service.impl;

import com.ems.dto.admin.AdminAnalyticsResponse;
import com.ems.dto.auth.UserSummaryResponse;
import com.ems.dto.booking.BookingResponse;
import com.ems.dto.booking.BookingStatusUpdateRequest;
import com.ems.entity.Booking;
import com.ems.entity.User;
import com.ems.entity.enums.BookingStatus;
import com.ems.entity.enums.Role;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.notification.BookingNotification;
import com.ems.repository.BookingRepository;
import com.ems.repository.EventRepository;
import com.ems.repository.FavoriteRepository;
import com.ems.repository.ReviewRepository;
import com.ems.repository.UserRepository;
import com.ems.service.AdminService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final FavoriteRepository favoriteRepository;
    private final ReviewRepository reviewRepository;
    private final ApplicationEventPublisher eventPublisher;

    public AdminServiceImpl(
            UserRepository userRepository,
            BookingRepository bookingRepository,
            EventRepository eventRepository,
            FavoriteRepository favoriteRepository,
            ReviewRepository reviewRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.eventRepository = eventRepository;
        this.favoriteRepository = favoriteRepository;
        this.reviewRepository = reviewRepository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public List<UserSummaryResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapUserSummary)
                .toList();
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByBookingDateDesc()
                .stream()
                .map(this::mapBookingResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        if (user.getRole() != null && user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Admin users cannot be deleted");
        }

        reviewRepository.deleteAllByUserId(userId);
        favoriteRepository.deleteAllByUserId(userId);
        bookingRepository.deleteAllByUserId(userId);
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public BookingResponse updateBookingStatus(Long bookingId, BookingStatusUpdateRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        if (request.getStatus() == BookingStatus.BOOKED && booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cancelled bookings cannot be accepted");
        }
        if (booking.isCheckedIn() && request.getStatus() != BookingStatus.BOOKED) {
            throw new BadRequestException("Checked-in bookings cannot be changed");
        }
        if (request.getStatus() == BookingStatus.BOOKED && booking.getStatus() != BookingStatus.BOOKED) {
            Long eventId = booking.getEvent().getId();
            Integer eventCapacity = eventRepository.findLockedById(eventId)
                    .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId))
                    .getCapacity();
            int capacity = eventCapacity == null ? 100 : eventCapacity;
            long otherReservedSeats = bookingRepository.countByEventIdAndStatusInAndIdNot(
                    eventId,
                    List.of(BookingStatus.BOOKED, BookingStatus.PENDING),
                    booking.getId()
            );
            if (otherReservedSeats >= capacity) {
                throw new BadRequestException("Event is sold out");
            }
        }
        booking.setStatus(request.getStatus());
        Booking saved = bookingRepository.save(booking);
        publishBookingNotification(saved, statusMessage(saved.getStatus()));
        return mapBookingResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse checkInBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        if (booking.getStatus() != BookingStatus.BOOKED) {
            throw new BadRequestException("Only booked tickets can be checked in");
        }
        if (booking.isCheckedIn()) {
            return mapBookingResponse(booking);
        }
        booking.setCheckedIn(true);
        return mapBookingResponse(bookingRepository.save(booking));
    }

    @Override
    public AdminAnalyticsResponse getAnalytics() {
        List<Booking> bookings = bookingRepository.findAll();
        AdminAnalyticsResponse response = new AdminAnalyticsResponse();
        response.setTotalUsers(userRepository.countByRole(Role.USER));
        response.setTotalEvents(eventRepository.count());
        response.setTotalBookings(bookings.size());
        response.setRevenue(bookings.stream()
                .filter(booking -> booking.getStatus() == BookingStatus.BOOKED)
                .map(this::resolveRevenueAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        Map<String, Long> categories = bookings.stream()
                .filter(booking -> booking.getStatus() == BookingStatus.BOOKED)
                .collect(Collectors.groupingBy(booking -> booking.getEvent().getCategory(), Collectors.counting()));
        response.setPopularCategories(categories);
        return response;
    }

    private BigDecimal resolveRevenueAmount(Booking booking) {
        if (booking.getFinalPrice() != null && booking.getFinalPrice().compareTo(BigDecimal.ZERO) > 0) {
            return booking.getFinalPrice();
        }
        return booking.getEvent().getPrice() == null ? BigDecimal.ZERO : booking.getEvent().getPrice();
    }

    private UserSummaryResponse mapUserSummary(User user) {
        UserSummaryResponse response = new UserSummaryResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setTotalBookings(Math.toIntExact(bookingRepository.countByUserId(user.getId())));
        return response;
    }

    private BookingResponse mapBookingResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setUserId(booking.getUser().getId());
        response.setUserName(booking.getUser().getName());
        response.setEventId(booking.getEvent().getId());
        response.setEventName(booking.getEvent().getName());
        response.setEventDate(booking.getEvent().getDate());
        response.setEventPrice(booking.getEvent().getPrice());
        response.setFinalPrice(booking.getFinalPrice());
        response.setBookingDate(booking.getBookingDate());
        response.setStatus(booking.getStatus());
        response.setCouponCode(booking.getCouponCode());
        response.setPaymentMethod(booking.getPaymentMethod());
        response.setPaymentStatus(booking.getPaymentStatus());
        response.setTicketCode(booking.getTicketCode());
        response.setQrPayload("EMS|booking=" + booking.getId() + "|ticket=" + booking.getTicketCode());
        response.setCheckedIn(booking.isCheckedIn());
        return response;
    }

    private void publishBookingNotification(Booking booking, String message) {
        eventPublisher.publishEvent(new BookingNotification(
                booking.getUser().getEmail(),
                booking.getUser().getName(),
                booking.getEvent().getName(),
                booking.getEvent().getDate(),
                booking.getStatus(),
                booking.getTicketCode(),
                booking.getFinalPrice(),
                message
        ));
    }

    private String statusMessage(BookingStatus status) {
        return switch (status) {
            case BOOKED -> "Your booking has been accepted. Please keep your ticket code ready for check-in.";
            case CANCELLED -> "Your booking has been cancelled. Please contact the organizer if you need more details.";
            case PENDING -> "Your booking status has been moved back to pending.";
        };
    }
}
