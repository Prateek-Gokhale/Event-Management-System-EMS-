USE ems_db;

-- Sample users.
-- Admin password: Admin@123
-- User password: User@123
INSERT INTO users (name, email, password, role) VALUES
('EMS Admin', 'admin@ems.com', '$2a$10$Oa6wUnVrCmFTI7ch/16aROJrLhwPKCMteLc1eYqe39NOdyArUGtWu', 'ADMIN'),
('John User', 'user@ems.com', '$2a$10$ut3yz1xcyMShKBBX8Bpui.Vv00WDgAi.KFx7.QKksMff7bDgtmhJq', 'USER');

INSERT INTO events (
    name, category, description, event_date, price, image_url,
    capacity, venue, city, address, organizer_name, organizer_contact
) VALUES
('Tech Summit 2026', 'Technology', 'A full-day tech conference on AI, cloud, and modern web development.', '2026-06-12 10:00:00', 1499.00, 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d', 180, 'Namma Tech Park', 'Bengaluru', 'Whitefield Main Road', 'EventHub Organizers', 'organizer@ems.com'),
('Startup Pitch Night', 'Business', 'Founders pitch innovative startup ideas to mentors and investors.', '2026-06-18 18:30:00', 799.00, 'https://images.unsplash.com/photo-1552664730-d307ca884978', 120, 'BKC Innovation Hall', 'Mumbai', 'Bandra Kurla Complex', 'EventHub Organizers', 'organizer@ems.com'),
('Music & Lights Festival', 'Entertainment', 'Live music, immersive lights, and food experiences in one place.', '2026-06-25 16:00:00', 1999.00, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30', 500, 'Miramar Beach Grounds', 'Goa', 'Miramar Beach Road', 'EventHub Organizers', 'organizer@ems.com'),
('Photography Masterclass', 'Workshop', 'Hands-on workshop for portrait and street photography with experts.', '2026-07-02 09:30:00', 999.00, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', 60, 'Pink City Arts Studio', 'Jaipur', 'C-Scheme', 'EventHub Organizers', 'organizer@ems.com'),
('City Marathon', 'Sports', 'Annual marathon event featuring 5K, 10K, and full marathon tracks.', '2026-07-09 06:00:00', 499.00, 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211', 1000, 'Jawaharlal Nehru Stadium', 'Delhi', 'Lodhi Road', 'EventHub Organizers', 'organizer@ems.com'),
('Design Thinking Bootcamp', 'Education', 'Interactive sessions on product thinking, customer empathy, and ideation.', '2026-07-14 10:00:00', 1299.00, 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40', 90, 'Baner Learning Lab', 'Pune', 'Baner Road', 'EventHub Organizers', 'organizer@ems.com'),
('Food Carnival Weekend', 'Food', 'A weekend of regional food stalls, chef demos, tastings, and family activities.', '2026-07-19 12:00:00', 699.00, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', 350, 'HITEX Exhibition Centre', 'Hyderabad', 'Madhapur', 'EventHub Organizers', 'organizer@ems.com'),
('Wellness Yoga Retreat', 'Wellness', 'Guided yoga, mindfulness sessions, nutrition talks, and restorative workshops.', '2026-07-24 07:00:00', 1599.00, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773', 80, 'ECR Wellness Grove', 'Chennai', 'East Coast Road', 'EventHub Organizers', 'organizer@ems.com'),
('Art & Craft Expo', 'Art', 'A curated exhibition of contemporary art, handmade crafts, and creator-led demos.', '2026-07-29 11:00:00', 599.00, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f', 140, 'Rajarhat Art Pavilion', 'Kolkata', 'New Town', 'EventHub Organizers', 'organizer@ems.com'),
('FinTech Leaders Forum', 'Finance', 'Industry talks on digital payments, lending platforms, compliance, and fintech growth.', '2026-08-03 09:30:00', 1899.00, 'https://images.unsplash.com/photo-1554224155-6726b3ff858f', 160, 'Sabarmati Convention Hall', 'Ahmedabad', 'Ashram Road', 'EventHub Organizers', 'organizer@ems.com'),
('Comedy Night Live', 'Entertainment', 'Stand-up comedy sets from touring performers with an intimate club-style setup.', '2026-08-06 19:30:00', 899.00, 'https://images.unsplash.com/photo-1527224857830-43a7acc85260', 110, 'Gomti Comedy Club', 'Lucknow', 'Gomti Nagar', 'EventHub Organizers', 'organizer@ems.com'),
('Robotics Lab Sprint', 'Technology', 'Build, test, and demo robotics prototypes in a mentor-led weekend sprint.', '2026-08-11 10:00:00', 1399.00, 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e', 75, 'Sector 62 Innovation Lab', 'Noida', 'Sector 62', 'EventHub Organizers', 'organizer@ems.com'),
('Literature & Ideas Fest', 'Culture', 'Author conversations, book launches, poetry readings, and panel discussions.', '2026-08-15 10:30:00', 749.00, 'https://images.unsplash.com/photo-1519682337058-a94d519337bc', 220, 'Lakeview Cultural Centre', 'Bhopal', 'Shamla Hills', 'EventHub Organizers', 'organizer@ems.com'),
('Cycling Challenge', 'Sports', 'A city cycling challenge with timed routes, hydration stops, and finisher medals.', '2026-08-19 06:30:00', 549.00, 'https://images.unsplash.com/photo-1485965120184-e220f721d03e', 400, 'Sukhna Lake Start Point', 'Chandigarh', 'Sector 1', 'EventHub Organizers', 'organizer@ems.com'),
('Cloud DevOps Workshop', 'Workshop', 'Hands-on CI/CD, containers, observability, and cloud deployment practices.', '2026-08-23 09:00:00', 1699.00, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa', 85, 'Infopark Training Hub', 'Kochi', 'Kakkanad', 'EventHub Organizers', 'organizer@ems.com'),
('Sustainable Living Fair', 'Lifestyle', 'Eco-friendly brands, waste reduction demos, gardening sessions, and local makers.', '2026-08-28 10:00:00', 399.00, 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735', 300, 'Brilliant Convention Centre', 'Indore', 'Vijay Nagar', 'EventHub Organizers', 'organizer@ems.com');

INSERT INTO bookings (
    user_id, event_id, booking_date, status, final_price,
    payment_method, payment_status, ticket_code, checked_in
) VALUES
(2, 1, '2026-05-01 14:10:00', 'BOOKED', 1499.00, 'MOCK_CARD', 'MOCK_PAID', 'EMS-SAMPLE1', b'0'),
(2, 3, '2026-05-03 11:35:00', 'CANCELLED', 1999.00, 'MOCK_CARD', 'MOCK_PAID', 'EMS-SAMPLE2', b'0');
