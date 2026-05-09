package com.ems.service.impl;

import com.ems.dto.event.EventRequest;
import com.ems.dto.event.EventResponse;
import com.ems.entity.Event;
import com.ems.entity.Review;
import com.ems.entity.enums.BookingStatus;
import com.ems.exception.BadRequestException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.BookingRepository;
import com.ems.repository.BookingEventStats;
import com.ems.repository.EventRepository;
import com.ems.repository.FavoriteRepository;
import com.ems.repository.ReviewRepository;
import com.ems.repository.ReviewEventStats;
import com.ems.service.EventService;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class EventServiceImpl implements EventService {

    private static final List<BookingStatus> ACTIVE_BOOKING_STATUSES = List.of(BookingStatus.BOOKED, BookingStatus.PENDING);

    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final FavoriteRepository favoriteRepository;
    private final ReviewRepository reviewRepository;

    public EventServiceImpl(EventRepository eventRepository, BookingRepository bookingRepository, FavoriteRepository favoriteRepository, ReviewRepository reviewRepository) {
        this.eventRepository = eventRepository;
        this.bookingRepository = bookingRepository;
        this.favoriteRepository = favoriteRepository;
        this.reviewRepository = reviewRepository;
    }

    @Override
    public List<EventResponse> getAllEvents(String category, String search, String city, LocalDate from, LocalDate to, BigDecimal minPrice, BigDecimal maxPrice) {
        String categoryFilter = category == null ? "" : category.trim().toLowerCase(Locale.ROOT);
        String searchFilter = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        String cityFilter = city == null ? "" : city.trim().toLowerCase(Locale.ROOT);

        List<Event> events = eventRepository.findAll(
                        buildEventSpecification(categoryFilter, searchFilter, cityFilter, from, to, minPrice, maxPrice),
                        Sort.by(Sort.Direction.ASC, "date")
                );
        return mapEventResponses(events);
    }

    private List<EventResponse> mapEventResponses(List<Event> events) {
        if (events.isEmpty()) {
            return List.of();
        }
        List<Long> eventIds = events.stream().map(Event::getId).toList();
        Map<Long, BookingEventStats> bookingStats = bookingRepository.findEventStats(eventIds, ACTIVE_BOOKING_STATUSES)
                .stream()
                .collect(Collectors.toMap(BookingEventStats::getEventId, Function.identity()));
        Map<Long, ReviewEventStats> reviewStats = reviewRepository.findEventStats(eventIds)
                .stream()
                .collect(Collectors.toMap(ReviewEventStats::getEventId, Function.identity()));

        return events.stream()
                .map(event -> mapEventResponse(event, bookingStats.get(event.getId()), reviewStats.get(event.getId())))
                .toList();
    }

    @Override
    public EventResponse getEventById(Long id) {
        Event event = findEvent(id);
        return mapEventResponse(event);
    }

    @Override
    public EventResponse createEvent(EventRequest request) {
        Event event = new Event();
        applyRequest(event, request);
        Event saved = eventRepository.save(event);
        return mapEventResponse(saved);
    }

    @Override
    public EventResponse updateEvent(Long id, EventRequest request) {
        Event event = findEvent(id);
        validateCapacityChange(event, request);
        applyRequest(event, request);
        Event updated = eventRepository.save(event);
        return mapEventResponse(updated);
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        Event event = findEvent(id);
        favoriteRepository.deleteAllByEventId(id);
        reviewRepository.deleteAllByEventId(id);
        bookingRepository.deleteAllByEventId(id);
        eventRepository.delete(event);
    }

    private Event findEvent(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
    }

    private Specification<Event> buildEventSpecification(
            String category,
            String search,
            String city,
            LocalDate from,
            LocalDate to,
            BigDecimal minPrice,
            BigDecimal maxPrice
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (!category.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("category")), "%" + category + "%"));
            }
            if (!city.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("city")), "%" + city + "%"));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("date"), from.atStartOfDay()));
            }
            if (to != null) {
                predicates.add(cb.lessThan(root.get("date"), to.plusDays(1).atStartOfDay()));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            if (!search.isBlank()) {
                String pattern = "%" + search + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private void applyRequest(Event event, EventRequest request) {
        event.setName(request.getName().trim());
        event.setCategory(request.getCategory().trim());
        event.setDescription(request.getDescription().trim());
        event.setDate(request.getDate());
        event.setPrice(request.getPrice());
        event.setImageUrl(request.getImageUrl().trim());
        event.setCapacity(request.getCapacity());
        event.setVenue(clean(request.getVenue()));
        event.setCity(clean(request.getCity()));
        event.setAddress(clean(request.getAddress()));
        event.setOrganizerName(clean(request.getOrganizerName()));
        event.setOrganizerContact(clean(request.getOrganizerContact()));
    }

    private void validateCapacityChange(Event event, EventRequest request) {
        long reservedSeats = bookingRepository.countByEventIdAndStatusIn(event.getId(), ACTIVE_BOOKING_STATUSES);
        if (request.getCapacity() != null && request.getCapacity() < reservedSeats) {
            throw new BadRequestException("Capacity cannot be lower than existing active bookings");
        }
    }

    private EventResponse mapEventResponse(Event event) {
        return mapEventResponse(
                event,
                singleBookingStats(event.getId()),
                singleReviewStats(event.getId())
        );
    }

    private BookingEventStats singleBookingStats(Long eventId) {
        return bookingRepository.findEventStats(List.of(eventId), ACTIVE_BOOKING_STATUSES)
                .stream()
                .findFirst()
                .orElse(null);
    }

    private ReviewEventStats singleReviewStats(Long eventId) {
        return reviewRepository.findEventStats(List.of(eventId))
                .stream()
                .findFirst()
                .orElse(null);
    }

    private EventResponse mapEventResponse(Event event, BookingEventStats bookingStats, ReviewEventStats reviewStats) {
        int capacity = event.getCapacity() == null ? 100 : event.getCapacity();
        long bookedSeats = bookingStats == null || bookingStats.getBookedSeats() == null ? 0 : bookingStats.getBookedSeats();
        long reservedSeats = bookingStats == null || bookingStats.getReservedSeats() == null ? 0 : bookingStats.getReservedSeats();
        double averageRating = reviewStats == null || reviewStats.getAverageRating() == null ? 0.0 : reviewStats.getAverageRating();
        long reviewCount = reviewStats == null || reviewStats.getReviewCount() == null ? 0 : reviewStats.getReviewCount();
        EventResponse response = new EventResponse();
        response.setId(event.getId());
        response.setName(event.getName());
        response.setCategory(event.getCategory());
        response.setDescription(event.getDescription());
        response.setDate(event.getDate());
        response.setPrice(event.getPrice());
        response.setImageUrl(event.getImageUrl());
        response.setCapacity(capacity);
        response.setBookedSeats(bookedSeats);
        response.setAvailableSeats(Math.max(0, capacity - reservedSeats));
        response.setVenue(event.getVenue());
        response.setCity(event.getCity());
        response.setAddress(event.getAddress());
        response.setMapUrl(buildMapUrl(event));
        response.setOrganizerName(event.getOrganizerName());
        response.setOrganizerContact(event.getOrganizerContact());
        response.setAverageRating(Math.round(averageRating * 10.0) / 10.0);
        response.setReviewCount(reviewCount);
        return response;
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String buildMapUrl(Event event) {
        String location = String.join(" ",
                event.getVenue() == null ? "" : event.getVenue(),
                event.getAddress() == null ? "" : event.getAddress(),
                event.getCity() == null ? "" : event.getCity()).trim();
        if (location.isBlank()) {
            return null;
        }
        return "https://www.google.com/maps/search/?api=1&query=" + URLEncoder.encode(location, StandardCharsets.UTF_8);
    }
}
