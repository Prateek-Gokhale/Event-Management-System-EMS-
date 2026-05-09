package com.ems.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class BookingNotificationListener {

    private static final Logger log = LoggerFactory.getLogger(BookingNotificationListener.class);

    private final NotificationService notificationService;

    public BookingNotificationListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleBookingNotification(BookingNotification notification) {
        try {
            notificationService.sendBookingNotification(notification);
        } catch (RuntimeException ex) {
            log.warn("Booking notification failed for {}", notification.recipientEmail(), ex);
        }
    }
}
