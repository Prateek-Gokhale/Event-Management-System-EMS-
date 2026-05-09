package com.ems.service.impl;

import com.ems.dto.booking.BookingRequest;
import com.ems.dto.booking.BookingResponse;
import com.ems.entity.Booking;
import com.ems.entity.Coupon;
import com.ems.entity.Event;
import com.ems.entity.User;
import com.ems.entity.enums.BookingStatus;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.notification.BookingNotification;
import com.ems.repository.BookingRepository;
import com.ems.repository.CouponRepository;
import com.ems.repository.EventRepository;
import com.ems.repository.UserRepository;
import com.ems.service.BookingService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Comparator;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingServiceImpl implements BookingService {

    private static final List<BookingStatus> ACTIVE_BOOKING_STATUSES = List.of(BookingStatus.BOOKED, BookingStatus.PENDING);

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final CouponRepository couponRepository;
    private final ApplicationEventPublisher eventPublisher;

    public BookingServiceImpl(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            EventRepository eventRepository,
            CouponRepository couponRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.couponRepository = couponRepository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public BookingResponse createBooking(String currentUserEmail, BookingRequest request) {
        User user = findUser(currentUserEmail);
        return createBookingForUser(user, request);
    }

    @Override
    @Transactional
    public List<BookingResponse> createBookings(String currentUserEmail, List<BookingRequest> requests) {
        Set<Long> eventIds = requests.stream()
                .map(BookingRequest::getEventId)
                .collect(Collectors.toSet());
        if (eventIds.size() != requests.size()) {
            throw new BadRequestException("Duplicate events are not allowed in one checkout");
        }
        User user = findUser(currentUserEmail);
        return requests.stream()
                .sorted(Comparator.comparing(BookingRequest::getEventId))
                .map(request -> createBookingForUser(user, request))
                .toList();
    }

    private BookingResponse createBookingForUser(User user, BookingRequest request) {
        Event event = eventRepository.findLockedById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        validateBookingAllowed(user, event);

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus(BookingStatus.PENDING);
        booking.setCouponCode(cleanUpper(request.getCouponCode()));
        booking.setPaymentMethod(clean(request.getPaymentMethod(), "MOCK_CARD"));
        booking.setPaymentStatus("MOCK_PAID");
        booking.setTicketCode("EMS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT));
        booking.setFinalPrice(applyCoupon(event.getPrice(), booking.getCouponCode()));

        Booking saved = bookingRepository.save(booking);
        publishBookingNotification(saved, "Your booking request has been received. The organizer will review and confirm it soon.");
        return mapBookingResponse(saved);
    }

    private User findUser(String currentUserEmail) {
        return userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void validateBookingAllowed(User user, Event event) {
        if (bookingRepository.existsByUserIdAndEventIdAndStatus(user.getId(), event.getId(), BookingStatus.BOOKED)
                || bookingRepository.existsByUserIdAndEventIdAndStatus(user.getId(), event.getId(), BookingStatus.PENDING)) {
            throw new BadRequestException("Event already booked by this user");
        }
        int capacity = event.getCapacity() == null ? 100 : event.getCapacity();
        long reservedSeats = bookingRepository.countByEventIdAndStatusIn(event.getId(), ACTIVE_BOOKING_STATUSES);
        if (reservedSeats >= capacity) {
            throw new BadRequestException("Event is sold out");
        }
    }

    @Override
    public List<BookingResponse> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByBookingDateDesc(userId)
                .stream()
                .map(this::mapBookingResponse)
                .toList();
    }

    @Override
    public List<BookingResponse> getCurrentUserBookings(String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return getUserBookings(user.getId());
    }

    @Override
    @Transactional
    public BookingResponse checkInBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        if (booking.getStatus() != BookingStatus.BOOKED) {
            throw new BadRequestException("Only booked tickets can be checked in");
        }
        booking.setCheckedIn(true);
        return mapBookingResponse(bookingRepository.save(booking));
    }

    public BookingResponse mapBookingResponse(Booking booking) {
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

    private BigDecimal applyCoupon(BigDecimal price, String couponCode) {
        if (couponCode == null || couponCode.isBlank()) {
            return price;
        }
        Coupon coupon = couponRepository.findByCodeIgnoreCaseAndActiveTrue(couponCode)
                .orElseThrow(() -> new BadRequestException("Invalid coupon code"));
        BigDecimal discount = price.multiply(coupon.getDiscountPercent()).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        return price.subtract(discount).max(BigDecimal.ZERO);
    }

    private String cleanUpper(String value) {
        return value == null || value.isBlank() ? null : value.trim().toUpperCase(Locale.ROOT);
    }

    private String clean(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
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
}
