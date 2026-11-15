package com.nabhaleam.notifications;

import com.nabhaleam.common.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;

    public void notify(String studentId, NotificationType type, String title, String message,
                       String link, String dedupeKey) {
        if (dedupeKey != null && repository.existsByStudentIdAndDedupeKey(studentId, dedupeKey)) {
            return;
        }
        Notification notification = Notification.builder()
                .studentId(studentId)
                .type(type)
                .title(title)
                .message(message)
                .link(link)
                .dedupeKey(dedupeKey)
                .read(false)
                .build();
        repository.save(notification);
    }

    public void notify(String studentId, NotificationType type, String title, String message, String link) {
        notify(studentId, type, title, message, link, null);
    }

    public long unreadCount(String studentId) {
        return repository.countByStudentIdAndReadFalse(studentId);
    }

    public void markRead(String studentId, String notificationId) {
        Notification notification = repository.findByIdAndStudentId(notificationId, studentId)
                .orElseThrow(() -> ApiException.notFound("Notification not found."));
        if (!notification.isRead()) {
            notification.setRead(true);
            repository.save(notification);
        }
    }

    public int markAllRead(String studentId) {
        var unread = repository.findByStudentIdOrderByCreatedAtDesc(studentId,
                org.springframework.data.domain.PageRequest.of(0, 500)).getContent().stream()
                .filter(n -> !n.isRead())
                .toList();
        unread.forEach(n -> n.setRead(true));
        repository.saveAll(unread);
        return unread.size();
    }

    public void deleteAllForStudent(String studentId) {
        repository.deleteByStudentId(studentId);
    }
}
