USE ems_db;

-- Sample users (password for both accounts: password)
-- BCrypt hash generated with cost factor 10.
INSERT INTO users (name, email, password, role) VALUES
('EMS Admin', 'admin@ems.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN'),
('John User', 'user@ems.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER');

INSERT INTO events (name, category, description, event_date, price, image_url) VALUES
('Tech Summit 2026', 'Technology', 'A full-day tech conference on AI, cloud, and modern web development.', '2026-06-12 10:00:00', 1499.00, 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d'),
('Startup Pitch Night', 'Business', 'Founders pitch innovative startup ideas to mentors and investors.', '2026-06-18 18:30:00', 799.00, 'https://images.unsplash.com/photo-1552664730-d307ca884978'),
('Music and Lights Festival', 'Entertainment', 'Live music, immersive lights, and food experiences in one place.', '2026-06-25 16:00:00', 1999.00, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'),
('Photography Masterclass', 'Workshop', 'Hands-on workshop for portrait and street photography with experts.', '2026-07-02 09:30:00', 999.00, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32'),
('City Marathon', 'Sports', 'Annual marathon event featuring 5K, 10K, and full marathon tracks.', '2026-07-09 06:00:00', 499.00, 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211');

INSERT INTO bookings (user_id, event_id, booking_date, status) VALUES
(2, 1, '2026-05-01 14:10:00', 'BOOKED'),
(2, 3, '2026-05-03 11:35:00', 'CANCELLED');
