package com.ems.service.impl;

import com.ems.dto.event.EventRequest;
import com.ems.dto.event.EventResponse;
import com.ems.entity.Event;
import com.ems.entity.Review;
import com.ems.entity.enums.BookingStatus;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.BookingRepository;
import com.ems.repository.EventRepository;
import com.ems.repository.FavoriteRepository;
import com.ems.repository.ReviewRepository;
import com.ems.service.EventService;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;

@Service
public class EventServiceImpl implements EventService {

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

        return eventRepository.findAll()
                .stream()
                .filter(event -> categoryFilter.isBlank() || event.getCategory().toLowerCase(Locale.ROOT).contains(categoryFilter))
                .filter(event -> cityFilter.isBlank() || (event.getCity() != null && event.getCity().toLowerCase(Locale.ROOT).contains(cityFilter)))
                .filter(event -> from == null || !event.getDate().toLocalDate().isBefore(from))
                .filter(event -> to == null || !event.getDate().toLocalDate().isAfter(to))
                .filter(event -> minPrice == null || event.getPrice().compareTo(minPrice) >= 0)
                .filter(event -> maxPrice == null || event.getPrice().compareTo(maxPrice) <= 0)
                .filter(event -> {
                    if (searchFilter.isBlank()) {
                        return true;
                    }
                    return event.getName().toLowerCase(Locale.ROOT).contains(searchFilter)
                            || event.getDescription().toLowerCase(Locale.ROOT).contains(searchFilter);
                })
                .sorted(Comparator.comparing(Event::getDate))
                .map(this::mapEventResponse)
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

    private EventResponse mapEventResponse(Event event) {
        int capacity = event.getCapacity() == null ? 100 : event.getCapacity();
        long bookedSeats = bookingRepository.countByEventIdAndStatus(event.getId(), BookingStatus.BOOKED);
        List<Review> reviews = reviewRepository.findByEventIdOrderByCreatedAtDesc(event.getId());
        double averageRating = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
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
        response.setAvailableSeats(Math.max(0, capacity - bookedSeats));
        response.setVenue(event.getVenue());
        response.setCity(event.getCity());
        response.setAddress(event.getAddress());
        response.setMapUrl(buildMapUrl(event));
        response.setOrganizerName(event.getOrganizerName());
        response.setOrganizerContact(event.getOrganizerContact());
        response.setAverageRating(Math.round(averageRating * 10.0) / 10.0);
        response.setReviewCount(reviews.size());
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
