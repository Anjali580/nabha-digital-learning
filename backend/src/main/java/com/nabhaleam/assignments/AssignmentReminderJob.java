package com.nabhaleam.assignments;

import com.nabhaleam.notifications.NotificationService;
import com.nabhaleam.notifications.NotificationType;
import com.nabhaleam.users.Role;
import com.nabhaleam.users.User;
import com.nabhaleam.users.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Creates one reminder per assignment/student pair when the due date is within
 * 48 hours. Reminders are de-duplicated by a stable key, so restarting the
 * application does not spam notifications.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AssignmentReminderJob {

    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 8 * * *", zone = "Asia/Kolkata")
    public void sendDueReminders() {
        Instant now = Instant.now();
        Instant horizon = now.plus(Duration.ofHours(48));
        List<Assignment> dueSoon = assignmentRepository.findByPublishedTrue().stream()
                .filter(assignment -> assignment.getDueDate() != null)
                .filter(assignment -> assignment.getDueDate().isAfter(now)
                        && assignment.getDueDate().isBefore(horizon))
                .toList();
        if (dueSoon.isEmpty()) {
            return;
        }

        Map<String, List<Assignment>> byClass = new HashMap<>();
        dueSoon.forEach(assignment -> byClass
                .computeIfAbsent(assignment.getClassId(), key -> new java.util.ArrayList<>())
                .add(assignment));

        for (Role role : List.of(Role.STUDENT)) {
            for (User student : userRepository.findByRole(role)) {
                List<Assignment> assignments = byClass.get(student.getClassId());
                if (assignments == null) {
                    continue;
                }
                for (Assignment assignment : assignments) {
                    if (!submissionRepository.existsByAssignmentIdAndStudentId(assignment.getId(), student.getId())) {
                        notificationService.notify(student.getId(), NotificationType.ASSIGNMENT_DUE,
                                "Assignment due soon",
                                "\"" + assignment.getTitle() + "\" is due on "
                                        + assignment.getDueDate() + ". Submit it on time.",
                                "/app/assignments/" + assignment.getId(),
                                "assignment-due:" + assignment.getId());
                    }
                }
            }
        }
        log.info("Assignment due reminders evaluated for {} assignment(s)", dueSoon.size());
    }
}
