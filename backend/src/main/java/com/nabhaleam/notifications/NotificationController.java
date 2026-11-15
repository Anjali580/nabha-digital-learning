package com.nabhaleam.notifications;

import com.nabhaleam.common.ApiResponse;
import com.nabhaleam.common.PageResponse;
import com.nabhaleam.notifications.dto.NotificationDto;
import com.nabhaleam.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/student/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository repository;
    private final NotificationService service;

    @GetMapping
    public ApiResponse<PageResponse<NotificationDto>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String studentId = SecurityUtils.currentUserId();
        var result = repository.findByStudentIdOrderByCreatedAtDesc(studentId,
                PageRequest.of(Math.max(0, page), Math.max(1, Math.min(size, 50))));
        return ApiResponse.ok(PageResponse.from(result, NotificationDto::from));
    }

    @GetMapping("/unread-count")
    public ApiResponse<Map<String, Long>> unreadCount() {
        return ApiResponse.ok(Map.of("count", service.unreadCount(SecurityUtils.currentUserId())));
    }

    @PatchMapping("/{notificationId}/read")
    public ApiResponse<Void> markRead(@PathVariable String notificationId) {
        service.markRead(SecurityUtils.currentUserId(), notificationId);
        return ApiResponse.message("Notification marked as read.");
    }

    @PatchMapping("/read-all")
    public ApiResponse<Map<String, Integer>> markAllRead() {
        int updated = service.markAllRead(SecurityUtils.currentUserId());
        return ApiResponse.ok("All notifications marked as read.", Map.of("updated", updated));
    }
}
