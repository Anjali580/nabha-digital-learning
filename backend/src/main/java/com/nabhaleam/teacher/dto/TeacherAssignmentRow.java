package com.nabhaleam.teacher.dto;

import java.time.Instant;

public record TeacherAssignmentRow(
        String id,
        String title,
        String description,
        String classId,
        String className,
        String subjectId,
        String subjectName,
        Instant assignedDate,
        Instant dueDate,
        int maxMarks,
        boolean published,
        long totalStudents,
        long submittedCount,
        long reviewedCount,
        long pendingReviews
) {
}
