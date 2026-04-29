package com.ems.service.impl;

import com.ems.dto.admin.AdminAnalyticsResponse;
import com.ems.dto.auth.UserSummaryResponse;
import com.ems.dto.booking.BookingResponse;
import com.ems.dto.booking.BookingStatusUpdateRequest;
import com.ems.entity.Booking;
import com.ems.entity.User;
import com.ems.entity.enums.BookingStatus;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.BookingRepository;
import com.ems.repository.EventRepository;
import com.ems.repository.UserRepository;
import com.ems.service.AdminService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;

    public AdminServiceImpl(
            UserRepository userRepository,
            BookingRepository bookingRepository,
            EventRepository eventRepository
    ) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.eventRepository = eventRepository;
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
    public BookingResponse updateBookingStatus(Long bookingId, BookingStatusUpdateRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        if (request.getStatus() == BookingStatus.BOOKED && booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cancelled bookings cannot be accepted");
        }
        booking.setStatus(request.getStatus());
        Booking saved = bookingRepository.save(booking);
        return mapBookingResponse(saved);
    }

    @Override
    public BookingResponse checkInBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        if (booking.getStatus() != BookingStatus.BOOKED) {
            throw new BadRequestException("Only booked tickets can be checked in");
        }
        booking.setCheckedIn(true);
        return mapBookingResponse(bookingRepository.save(booking));
    }

    @Override
    public AdminAnalyticsResponse getAnalytics() {
        List<Booking> bookings = bookingRepository.findAll();
        AdminAnalyticsResponse response = new AdminAnalyticsResponse();
        response.setTotalUsers(userRepository.count());
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
}
