package com.ems.service;

import com.ems.dto.event.EventRequest;
import com.ems.dto.event.EventResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface EventService {
    List<EventResponse> getAllEvents(String category, String search, String city, LocalDate from, LocalDate to, BigDecimal minPrice, BigDecimal maxPrice);
    EventResponse getEventById(Long id);
    EventResponse createEvent(EventRequest request);
    EventResponse updateEvent(Long id, EventRequest request);
    void deleteEvent(Long id);
}
