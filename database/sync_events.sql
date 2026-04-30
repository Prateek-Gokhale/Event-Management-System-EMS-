CREATE DATABASE IF NOT EXISTS ems_db;
USE ems_db;

CREATE TABLE IF NOT EXISTS events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(180) NOT NULL,
    category VARCHAR(80) NOT NULL,
    description VARCHAR(2500) NOT NULL,
    event_date DATETIME NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(1000),
    capacity INT DEFAULT 100,
    venue VARCHAR(180),
    city VARCHAR(120),
    address VARCHAR(500),
    organizer_name VARCHAR(180),
    organizer_contact VARCHAR(180)
);

DELIMITER //
CREATE PROCEDURE add_events_column_if_missing(
    IN p_column_name VARCHAR(64),
    IN p_column_definition VARCHAR(1000)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'events'
          AND column_name = p_column_name
    ) THEN
        SET @alter_sql = CONCAT('ALTER TABLE events ADD COLUMN ', p_column_name, ' ', p_column_definition);
        PREPARE alter_stmt FROM @alter_sql;
        EXECUTE alter_stmt;
        DEALLOCATE PREPARE alter_stmt;
    END IF;
END //
DELIMITER ;

CALL add_events_column_if_missing('capacity', 'INT DEFAULT 100');
CALL add_events_column_if_missing('venue', 'VARCHAR(180)');
CALL add_events_column_if_missing('city', 'VARCHAR(120)');
CALL add_events_column_if_missing('address', 'VARCHAR(500)');
CALL add_events_column_if_missing('organizer_name', 'VARCHAR(180)');
CALL add_events_column_if_missing('organizer_contact', 'VARCHAR(180)');

DROP PROCEDURE add_events_column_if_missing;

UPDATE events
SET name = 'Music & Lights Festival'
WHERE name = 'Music and Lights Festival';

CREATE TEMPORARY TABLE event_seed (
    name VARCHAR(180) NOT NULL PRIMARY KEY,
    category VARCHAR(80) NOT NULL,
    description VARCHAR(2500) NOT NULL,
    event_date DATETIME NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(1000),
    capacity INT DEFAULT 100,
    venue VARCHAR(180),
    city VARCHAR(120),
    address VARCHAR(500),
    organizer_name VARCHAR(180),
    organizer_contact VARCHAR(180)
);

INSERT INTO event_seed (
    name, category, description, event_date, price, image_url,
    capacity, venue, city, address, organizer_name, organizer_contact
) VALUES
('Tech Summit 2026', 'Technology', 'A full-day tech conference on AI, cloud, and modern web development.', DATE_ADD(NOW(), INTERVAL 10 DAY), 1499.00, 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d', 180, 'Namma Tech Park', 'Bengaluru', 'Whitefield Main Road', 'EventHub Organizers', 'organizer@ems.com'),
('Startup Pitch Night', 'Business', 'Founders pitch innovative startup ideas to mentors and investors.', DATE_ADD(NOW(), INTERVAL 15 DAY), 799.00, 'https://images.unsplash.com/photo-1552664730-d307ca884978', 120, 'BKC Innovation Hall', 'Mumbai', 'Bandra Kurla Complex', 'EventHub Organizers', 'organizer@ems.com'),
('Music & Lights Festival', 'Entertainment', 'Live music, immersive lights, and food experiences in one place.', DATE_ADD(NOW(), INTERVAL 22 DAY), 1999.00, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30', 500, 'Miramar Beach Grounds', 'Goa', 'Miramar Beach Road', 'EventHub Organizers', 'organizer@ems.com'),
('Photography Masterclass', 'Workshop', 'Hands-on workshop for portrait and street photography with experts.', DATE_ADD(NOW(), INTERVAL 30 DAY), 999.00, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', 60, 'Pink City Arts Studio', 'Jaipur', 'C-Scheme', 'EventHub Organizers', 'organizer@ems.com'),
('City Marathon', 'Sports', 'Annual marathon event featuring 5K, 10K, and full marathon tracks.', DATE_ADD(NOW(), INTERVAL 35 DAY), 499.00, 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211', 1000, 'Jawaharlal Nehru Stadium', 'Delhi', 'Lodhi Road', 'EventHub Organizers', 'organizer@ems.com'),
('Design Thinking Bootcamp', 'Education', 'Interactive sessions on product thinking, customer empathy, and ideation.', DATE_ADD(NOW(), INTERVAL 40 DAY), 1299.00, 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40', 90, 'Baner Learning Lab', 'Pune', 'Baner Road', 'EventHub Organizers', 'organizer@ems.com'),
('Food Carnival Weekend', 'Food', 'A weekend of regional food stalls, chef demos, tastings, and family activities.', DATE_ADD(NOW(), INTERVAL 45 DAY), 699.00, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', 350, 'HITEX Exhibition Centre', 'Hyderabad', 'Madhapur', 'EventHub Organizers', 'organizer@ems.com'),
('Wellness Yoga Retreat', 'Wellness', 'Guided yoga, mindfulness sessions, nutrition talks, and restorative workshops.', DATE_ADD(NOW(), INTERVAL 50 DAY), 1599.00, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773', 80, 'ECR Wellness Grove', 'Chennai', 'East Coast Road', 'EventHub Organizers', 'organizer@ems.com'),
('Art & Craft Expo', 'Art', 'A curated exhibition of contemporary art, handmade crafts, and creator-led demos.', DATE_ADD(NOW(), INTERVAL 55 DAY), 599.00, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f', 140, 'Rajarhat Art Pavilion', 'Kolkata', 'New Town', 'EventHub Organizers', 'organizer@ems.com'),
('FinTech Leaders Forum', 'Finance', 'Industry talks on digital payments, lending platforms, compliance, and fintech growth.', DATE_ADD(NOW(), INTERVAL 60 DAY), 1899.00, 'https://images.unsplash.com/photo-1554224155-6726b3ff858f', 160, 'Sabarmati Convention Hall', 'Ahmedabad', 'Ashram Road', 'EventHub Organizers', 'organizer@ems.com'),
('Comedy Night Live', 'Entertainment', 'Stand-up comedy sets from touring performers with an intimate club-style setup.', DATE_ADD(NOW(), INTERVAL 63 DAY), 899.00, 'https://images.unsplash.com/photo-1527224857830-43a7acc85260', 110, 'Gomti Comedy Club', 'Lucknow', 'Gomti Nagar', 'EventHub Organizers', 'organizer@ems.com'),
('Robotics Lab Sprint', 'Technology', 'Build, test, and demo robotics prototypes in a mentor-led weekend sprint.', DATE_ADD(NOW(), INTERVAL 68 DAY), 1399.00, 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e', 75, 'Sector 62 Innovation Lab', 'Noida', 'Sector 62', 'EventHub Organizers', 'organizer@ems.com'),
('Literature & Ideas Fest', 'Culture', 'Author conversations, book launches, poetry readings, and panel discussions.', DATE_ADD(NOW(), INTERVAL 72 DAY), 749.00, 'https://images.unsplash.com/photo-1519682337058-a94d519337bc', 220, 'Lakeview Cultural Centre', 'Bhopal', 'Shamla Hills', 'EventHub Organizers', 'organizer@ems.com'),
('Cycling Challenge', 'Sports', 'A city cycling challenge with timed routes, hydration stops, and finisher medals.', DATE_ADD(NOW(), INTERVAL 76 DAY), 549.00, 'https://images.unsplash.com/photo-1485965120184-e220f721d03e', 400, 'Sukhna Lake Start Point', 'Chandigarh', 'Sector 1', 'EventHub Organizers', 'organizer@ems.com'),
('Cloud DevOps Workshop', 'Workshop', 'Hands-on CI/CD, containers, observability, and cloud deployment practices.', DATE_ADD(NOW(), INTERVAL 80 DAY), 1699.00, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa', 85, 'Infopark Training Hub', 'Kochi', 'Kakkanad', 'EventHub Organizers', 'organizer@ems.com'),
('Sustainable Living Fair', 'Lifestyle', 'Eco-friendly brands, waste reduction demos, gardening sessions, and local makers.', DATE_ADD(NOW(), INTERVAL 85 DAY), 399.00, 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735', 300, 'Brilliant Convention Centre', 'Indore', 'Vijay Nagar', 'EventHub Organizers', 'organizer@ems.com');

UPDATE events e
JOIN event_seed s ON LOWER(e.name) = LOWER(s.name)
SET e.category = s.category,
    e.description = s.description,
    e.event_date = s.event_date,
    e.price = s.price,
    e.image_url = s.image_url,
    e.capacity = s.capacity,
    e.venue = s.venue,
    e.city = s.city,
    e.address = s.address,
    e.organizer_name = s.organizer_name,
    e.organizer_contact = s.organizer_contact;

INSERT INTO events (
    name, category, description, event_date, price, image_url,
    capacity, venue, city, address, organizer_name, organizer_contact
)
SELECT
    s.name, s.category, s.description, s.event_date, s.price, s.image_url,
    s.capacity, s.venue, s.city, s.address, s.organizer_name, s.organizer_contact
FROM event_seed s
WHERE NOT EXISTS (
    SELECT 1
    FROM events e
    WHERE LOWER(e.name) = LOWER(s.name)
);

DROP TEMPORARY TABLE event_seed;

SELECT COUNT(*) AS event_count FROM events;

UPDATE bookings SET checked_in = b'0' WHERE checked_in IS NULL;
ALTER TABLE bookings MODIFY checked_in BIT(1) NOT NULL DEFAULT b'0';
