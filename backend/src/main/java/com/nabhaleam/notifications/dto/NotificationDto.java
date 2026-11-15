package com.nabhaleam.notifications.dto;

import com.nabhaleam.notifications.Notification;

import java.time.Instant;

public record NotificationDto(
        String id,
        String type,
        String title,
        String message,
        String link,
        boolean read,
        Instant createdAt
) {
    public static NotificationDto from(Notification notification) {
        return new NotificationDto(notification.getId(), notification.getType().name(),
                notification.getTitle(), notification.getMessage(), notification.getLink(),
                notification.isRead(), notification.getCreatedAt());
    }
}
