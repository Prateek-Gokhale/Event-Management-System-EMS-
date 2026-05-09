package com.ems.notification;

import java.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "app.notifications.email.enabled", havingValue = "true")
public class EmailNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String fromAddress;

    public EmailNotificationService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.notifications.email.from}") String fromAddress
    ) {
        this.mailSenderProvider = mailSenderProvider;
        this.fromAddress = fromAddress;
    }

    @Override
    public void sendBookingNotification(BookingNotification notification) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("Email notifications are enabled, but no JavaMailSender is configured");
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(notification.recipientEmail());
        message.setSubject("EventHub booking update: " + notification.eventName());
        message.setText(buildBody(notification));
        mailSender.send(message);
    }

    private String buildBody(BookingNotification notification) {
        String eventDate = notification.eventDate() == null ? "TBA" : notification.eventDate().format(DATE_FORMAT);
        String ticketCode = notification.ticketCode() == null ? "Pending" : notification.ticketCode();
        String amount = notification.finalPrice() == null ? "N/A" : "Rs " + notification.finalPrice();

        return """
                Hello %s,

                %s

                Event: %s
                Date: %s
                Status: %s
                Ticket: %s
                Amount: %s

                You can view the latest booking details in your EventHub dashboard.
                """.formatted(
                notification.recipientName(),
                notification.message(),
                notification.eventName(),
                eventDate,
                notification.status(),
                ticketCode,
                amount
        );
    }
}
