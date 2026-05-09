package com.ems.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "app.notifications.email.enabled", havingValue = "false", matchIfMissing = true)
public class NoOpNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NoOpNotificationService.class);

    @Override
    public void sendBookingNotification(BookingNotification notification) {
        log.info(
                "Email notification skipped for {}: {} ({})",
                notification.recipientEmail(),
                notification.eventName(),
                notification.status()
        );
    }
}
