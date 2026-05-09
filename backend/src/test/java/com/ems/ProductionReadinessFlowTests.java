package com.ems;

import com.ems.entity.Event;
import com.ems.entity.Booking;
import com.ems.entity.User;
import com.ems.entity.enums.BookingStatus;
import com.ems.entity.enums.Role;
import com.ems.repository.BookingRepository;
import com.ems.repository.EventRepository;
import com.ems.repository.FavoriteRepository;
import com.ems.repository.ReviewRepository;
import com.ems.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductionReadinessFlowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanDatabase() {
        reviewRepository.deleteAll();
        favoriteRepository.deleteAll();
        bookingRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void pendingBookingReservesCapacity() throws Exception {
        Event event = saveEvent("Capacity Test", 1);
        String firstToken = registerAndLogin("one@example.com");
        String secondToken = registerAndLogin("two@example.com");

        createBooking(firstToken, event.getId()).andExpect(status().isCreated());
        createBooking(secondToken, event.getId()).andExpect(status().isBadRequest());

        assertThat(bookingRepository.count()).isEqualTo(1);
    }

    @Test
    void batchCheckoutRollsBackWhenAnyItemFails() throws Exception {
        Event available = saveEvent("Available", 2);
        Event full = saveEvent("Full", 1);
        String occupyingToken = registerAndLogin("occupier@example.com");
        String buyerToken = registerAndLogin("buyer@example.com");

        createBooking(occupyingToken, full.getId()).andExpect(status().isCreated());

        mockMvc.perform(post("/api/bookings/batch")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "items", java.util.List.of(
                                        Map.of("eventId", available.getId()),
                                        Map.of("eventId", full.getId())
                                )
                        ))))
                .andExpect(status().isBadRequest());

        assertThat(bookingRepository.countByEventIdAndStatusIn(
                available.getId(),
                java.util.List.of(BookingStatus.PENDING, BookingStatus.BOOKED)
        )).isZero();
    }

    @Test
    void onlyAcceptedBookingsCanReviewEvents() throws Exception {
        Event event = saveEvent("Review Test", 3);
        String userToken = registerAndLogin("reviewer@example.com");
        String adminToken = createAdminAndLogin("admin@example.com");

        createBooking(userToken, event.getId()).andExpect(status().isCreated());

        saveReview(userToken, event.getId()).andExpect(status().isBadRequest());

        Long bookingId = bookingRepository.findAll().get(0).getId();
        mockMvc.perform(put("/api/admin/bookings/" + bookingId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "BOOKED"))))
                .andExpect(status().isOk());

        saveReview(userToken, event.getId()).andExpect(status().isOk());
    }

    @Test
    void acceptingCancelledBookingCannotOverbookEvent() throws Exception {
        Event event = saveEvent("No Overbook", 1);
        User firstUser = saveUser("first@example.com", Role.USER);
        User secondUser = saveUser("second@example.com", Role.USER);
        String adminToken = createAdminAndLogin("capacity-admin@example.com");

        saveBooking(firstUser, event, BookingStatus.BOOKED);
        Booking cancelledBooking = saveBooking(secondUser, event, BookingStatus.CANCELLED);

        mockMvc.perform(put("/api/admin/bookings/" + cancelledBooking.getId() + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "BOOKED"))))
                .andExpect(status().isBadRequest());

        assertThat(bookingRepository.countByEventIdAndStatus(event.getId(), BookingStatus.BOOKED)).isEqualTo(1);
    }

    @Test
    void eventCapacityCannotBeReducedBelowActiveReservations() throws Exception {
        Event event = saveEvent("Capacity Update", 2);
        String firstToken = registerAndLogin("capacity-one@example.com");
        String secondToken = registerAndLogin("capacity-two@example.com");
        String adminToken = createAdminAndLogin("event-admin@example.com");

        createBooking(firstToken, event.getId()).andExpect(status().isCreated());
        createBooking(secondToken, event.getId()).andExpect(status().isCreated());

        mockMvc.perform(put("/api/events/" + event.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Capacity Update",
                                "category", "Technology",
                                "description", "A test event",
                                "date", LocalDateTime.now().plusDays(10).withNano(0).toString(),
                                "price", new BigDecimal("100.00"),
                                "imageUrl", "https://example.com/image.jpg",
                                "capacity", 1
                        ))))
                .andExpect(status().isBadRequest());

        assertThat(eventRepository.findById(event.getId()).orElseThrow().getCapacity()).isEqualTo(2);
    }

    private org.springframework.test.web.servlet.ResultActions createBooking(String token, Long eventId) throws Exception {
        return mockMvc.perform(post("/api/bookings")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("eventId", eventId))));
    }

    private org.springframework.test.web.servlet.ResultActions saveReview(String token, Long eventId) throws Exception {
        return mockMvc.perform(post("/api/events/" + eventId + "/reviews")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("rating", 5, "comment", "Good event"))));
    }

    private String registerAndLogin(String email) throws Exception {
        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Test User",
                                "email", email,
                "password", "Password@123"
                        ))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return tokenFrom(response);
    }

    private String createAdminAndLogin(String email) throws Exception {
        saveUser(email, Role.ADMIN);

        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email,
                                "password", "Admin@123"
                        ))))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return tokenFrom(response);
    }

    private User saveUser(String email, Role role) {
        User user = new User();
        user.setName(role == Role.ADMIN ? "Admin" : "Test User");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(role == Role.ADMIN ? "Admin@123" : "Password@123"));
        user.setRole(role);
        return userRepository.save(user);
    }

    private Booking saveBooking(User user, Event event, BookingStatus status) {
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus(status);
        booking.setFinalPrice(event.getPrice());
        booking.setPaymentMethod("MOCK_CARD");
        booking.setPaymentStatus("MOCK_PAID");
        booking.setTicketCode("TEST-" + user.getId() + "-" + event.getId());
        return bookingRepository.save(booking);
    }

    private String tokenFrom(String response) throws Exception {
        JsonNode json = objectMapper.readTree(response);
        return json.get("token").asText();
    }

    private Event saveEvent(String name, int capacity) {
        Event event = new Event();
        event.setName(name);
        event.setCategory("Technology");
        event.setDescription("A test event");
        event.setDate(LocalDateTime.now().plusDays(10));
        event.setPrice(new BigDecimal("100.00"));
        event.setImageUrl("https://example.com/image.jpg");
        event.setCapacity(capacity);
        return eventRepository.save(event);
    }
}
