package com.ems.config;

import com.ems.entity.Coupon;
import com.ems.entity.Event;
import com.ems.entity.User;
import com.ems.entity.enums.Role;
import com.ems.repository.CouponRepository;
import com.ems.repository.EventRepository;
import com.ems.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner seedData(UserRepository userRepository, EventRepository eventRepository, CouponRepository couponRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setName("EMS Admin");
                admin.setEmail("admin@ems.com");
                admin.setPassword(passwordEncoder.encode("Admin@123"));
                admin.setRole(Role.ADMIN);

                User user = new User();
                user.setName("John User");
                user.setEmail("user@ems.com");
                user.setPassword(passwordEncoder.encode("User@123"));
                user.setRole(Role.USER);

                userRepository.saveAll(List.of(admin, user));
            }

            syncSeedEvents(eventRepository);

            if (couponRepository.count() == 0) {
                Coupon welcome = new Coupon();
                welcome.setCode("WELCOME10");
                welcome.setDiscountPercent(new BigDecimal("10.00"));

                Coupon student = new Coupon();
                student.setCode("STUDENT20");
                student.setDiscountPercent(new BigDecimal("20.00"));
                couponRepository.saveAll(List.of(welcome, student));
            }
        };
    }

    private void syncSeedEvents(EventRepository eventRepository) {
        List<EventSeed> seeds = seedEvents();
        List<Event> existingEvents = eventRepository.findAll();
        List<Event> eventsToSave = new ArrayList<>();

        for (EventSeed seed : seeds) {
            Event event = existingEvents.stream()
                    .filter(existing -> existing.getName().equalsIgnoreCase(seed.name()))
                    .findFirst()
                    .orElseGet(() -> buildEvent(seed));
            applySeed(event, seed);
            eventsToSave.add(event);
        }

        eventRepository.saveAll(eventsToSave);
    }

    private List<EventSeed> seedEvents() {
        return List.of(
                new EventSeed(
                        "Tech Summit 2026",
                        "Technology",
                        "A full-day tech conference on AI, cloud, and modern web development.",
                        LocalDateTime.now().plusDays(10),
                        new BigDecimal("1499.00"),
                        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
                        "Bengaluru",
                        "Namma Tech Park",
                        "Whitefield Main Road",
                        180
                ),
                new EventSeed(
                        "Startup Pitch Night",
                        "Business",
                        "Founders pitch innovative startup ideas to mentors and investors.",
                        LocalDateTime.now().plusDays(15),
                        new BigDecimal("799.00"),
                        "https://images.unsplash.com/photo-1552664730-d307ca884978",
                        "Mumbai",
                        "BKC Innovation Hall",
                        "Bandra Kurla Complex",
                        120
                ),
                new EventSeed(
                        "Music & Lights Festival",
                        "Entertainment",
                        "Live music, immersive lights, and food experiences in one place.",
                        LocalDateTime.now().plusDays(22),
                        new BigDecimal("1999.00"),
                        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
                        "Goa",
                        "Miramar Beach Grounds",
                        "Miramar Beach Road",
                        500
                ),
                new EventSeed(
                        "Photography Masterclass",
                        "Workshop",
                        "Hands-on workshop for portrait and street photography with experts.",
                        LocalDateTime.now().plusDays(30),
                        new BigDecimal("999.00"),
                        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
                        "Jaipur",
                        "Pink City Arts Studio",
                        "C-Scheme",
                        60
                ),
                new EventSeed(
                        "City Marathon",
                        "Sports",
                        "Annual marathon event featuring 5K, 10K, and full marathon tracks.",
                        LocalDateTime.now().plusDays(35),
                        new BigDecimal("499.00"),
                        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211",
                        "Delhi",
                        "Jawaharlal Nehru Stadium",
                        "Lodhi Road",
                        1000
                ),
                new EventSeed(
                        "Design Thinking Bootcamp",
                        "Education",
                        "Interactive sessions on product thinking, customer empathy, and ideation.",
                        LocalDateTime.now().plusDays(40),
                        new BigDecimal("1299.00"),
                        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
                        "Pune",
                        "Baner Learning Lab",
                        "Baner Road",
                        90
                ),
                new EventSeed(
                        "Food Carnival Weekend",
                        "Food",
                        "A weekend of regional food stalls, chef demos, tastings, and family activities.",
                        LocalDateTime.now().plusDays(45),
                        new BigDecimal("699.00"),
                        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
                        "Hyderabad",
                        "HITEX Exhibition Centre",
                        "Madhapur",
                        350
                ),
                new EventSeed(
                        "Wellness Yoga Retreat",
                        "Wellness",
                        "Guided yoga, mindfulness sessions, nutrition talks, and restorative workshops.",
                        LocalDateTime.now().plusDays(50),
                        new BigDecimal("1599.00"),
                        "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
                        "Chennai",
                        "ECR Wellness Grove",
                        "East Coast Road",
                        80
                ),
                new EventSeed(
                        "Art & Craft Expo",
                        "Art",
                        "A curated exhibition of contemporary art, handmade crafts, and creator-led demos.",
                        LocalDateTime.now().plusDays(55),
                        new BigDecimal("599.00"),
                        "https://images.unsplash.com/photo-1513364776144-60967b0f800f",
                        "Kolkata",
                        "Rajarhat Art Pavilion",
                        "New Town",
                        140
                ),
                new EventSeed(
                        "FinTech Leaders Forum",
                        "Finance",
                        "Industry talks on digital payments, lending platforms, compliance, and fintech growth.",
                        LocalDateTime.now().plusDays(60),
                        new BigDecimal("1899.00"),
                        "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
                        "Ahmedabad",
                        "Sabarmati Convention Hall",
                        "Ashram Road",
                        160
                ),
                new EventSeed(
                        "Comedy Night Live",
                        "Entertainment",
                        "Stand-up comedy sets from touring performers with an intimate club-style setup.",
                        LocalDateTime.now().plusDays(63),
                        new BigDecimal("899.00"),
                        "https://images.unsplash.com/photo-1527224857830-43a7acc85260",
                        "Lucknow",
                        "Gomti Comedy Club",
                        "Gomti Nagar",
                        110
                ),
                new EventSeed(
                        "Robotics Lab Sprint",
                        "Technology",
                        "Build, test, and demo robotics prototypes in a mentor-led weekend sprint.",
                        LocalDateTime.now().plusDays(68),
                        new BigDecimal("1399.00"),
                        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
                        "Noida",
                        "Sector 62 Innovation Lab",
                        "Sector 62",
                        75
                ),
                new EventSeed(
                        "Literature & Ideas Fest",
                        "Culture",
                        "Author conversations, book launches, poetry readings, and panel discussions.",
                        LocalDateTime.now().plusDays(72),
                        new BigDecimal("749.00"),
                        "https://images.unsplash.com/photo-1519682337058-a94d519337bc",
                        "Bhopal",
                        "Lakeview Cultural Centre",
                        "Shamla Hills",
                        220
                ),
                new EventSeed(
                        "Cycling Challenge",
                        "Sports",
                        "A city cycling challenge with timed routes, hydration stops, and finisher medals.",
                        LocalDateTime.now().plusDays(76),
                        new BigDecimal("549.00"),
                        "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
                        "Chandigarh",
                        "Sukhna Lake Start Point",
                        "Sector 1",
                        400
                ),
                new EventSeed(
                        "Cloud DevOps Workshop",
                        "Workshop",
                        "Hands-on CI/CD, containers, observability, and cloud deployment practices.",
                        LocalDateTime.now().plusDays(80),
                        new BigDecimal("1699.00"),
                        "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
                        "Kochi",
                        "Infopark Training Hub",
                        "Kakkanad",
                        85
                ),
                new EventSeed(
                        "Sustainable Living Fair",
                        "Lifestyle",
                        "Eco-friendly brands, waste reduction demos, gardening sessions, and local makers.",
                        LocalDateTime.now().plusDays(85),
                        new BigDecimal("399.00"),
                        "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735",
                        "Indore",
                        "Brilliant Convention Centre",
                        "Vijay Nagar",
                        300
                )
        );
    }

    private Event buildEvent(EventSeed seed) {
        Event event = new Event();
        applySeed(event, seed);
        return event;
    }

    private void applySeed(Event event, EventSeed seed) {
        event.setName(seed.name());
        event.setCategory(seed.category());
        event.setDescription(seed.description());
        event.setDate(seed.date());
        event.setPrice(seed.price());
        event.setImageUrl(seed.imageUrl());
        event.setCapacity(seed.capacity());
        event.setVenue(seed.venue());
        event.setCity(seed.city());
        event.setAddress(seed.address());
        event.setOrganizerName("EventHub Organizers");
        event.setOrganizerContact("organizer@ems.com");
    }

    private record EventSeed(
            String name,
            String category,
            String description,
            LocalDateTime date,
            BigDecimal price,
            String imageUrl,
            String city,
            String venue,
            String address,
            Integer capacity
    ) {
    }
}
