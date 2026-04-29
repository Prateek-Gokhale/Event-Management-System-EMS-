package com.ems.dto.event;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class EventRequest {

    @NotBlank(message = "Event name is required")
    @Size(max = 180, message = "Event name must be at most 180 characters")
    private String name;

    @NotBlank(message = "Category is required")
    @Size(max = 80, message = "Category must be at most 80 characters")
    private String category;

    @NotBlank(message = "Description is required")
    @Size(max = 2500, message = "Description must be at most 2500 characters")
    private String description;

    @NotNull(message = "Event date is required")
    @Future(message = "Event date must be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime date;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    @NotNull(message = "Capacity is required")
    @Positive(message = "Capacity must be greater than 0")
    private Integer capacity = 100;

    @Size(max = 180, message = "Venue must be at most 180 characters")
    private String venue;

    @Size(max = 120, message = "City must be at most 120 characters")
    private String city;

    @Size(max = 500, message = "Address must be at most 500 characters")
    private String address;

    @Size(max = 180, message = "Organizer name must be at most 180 characters")
    private String organizerName;

    @Size(max = 180, message = "Organizer contact must be at most 180 characters")
    private String organizerContact;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getOrganizerName() {
        return organizerName;
    }

    public void setOrganizerName(String organizerName) {
        this.organizerName = organizerName;
    }

    public String getOrganizerContact() {
        return organizerContact;
    }

    public void setOrganizerContact(String organizerContact) {
        this.organizerContact = organizerContact;
    }
}
