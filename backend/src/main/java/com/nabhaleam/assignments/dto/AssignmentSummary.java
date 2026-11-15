package com.nabhaleam.assignments.dto;

import java.time.Instant;

public record AssignmentSummary(
        String id,
        String title,
        String description,
        String subjectId,
        String subjectName,
        String subjectIcon,
        String subjectColor,
        Instant assignedDate,
        Instant dueDate,
        int maxMarks,
        String status,
        Instant submittedAt,
        Integer marks,
        boolean hasFeedback,
        boolean overdue,
        int attachmentCount
) {
}
