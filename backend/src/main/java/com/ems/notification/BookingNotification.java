package com.ems.notification;

import com.ems.entity.enums.BookingStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BookingNotification(
        String recipientEmail,
        String recipientName,
        String eventName,
        LocalDateTime eventDate,
        BookingStatus status,
        String ticketCode,
        BigDecimal finalPrice,
        String message
) {
}
