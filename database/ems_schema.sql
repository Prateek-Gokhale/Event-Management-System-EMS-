CREATE DATABASE IF NOT EXISTS ems_db;
USE ems_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(16) NOT NULL
);

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

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    booking_date DATETIME NOT NULL,
    status VARCHAR(16) NOT NULL,
    final_price DECIMAL(10, 2) DEFAULT 0.00,
    coupon_code VARCHAR(40),
    payment_method VARCHAR(40),
    payment_status VARCHAR(24) DEFAULT 'MOCK_PAID',
    ticket_code VARCHAR(80) UNIQUE,
    checked_in BIT(1) NOT NULL DEFAULT b'0',
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_booking_event FOREIGN KEY (event_id) REFERENCES events(id)
);
