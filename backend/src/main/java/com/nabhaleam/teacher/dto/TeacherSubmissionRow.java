package com.nabhaleam.teacher.dto;

import java.time.Instant;

public record TeacherSubmissionRow(
        String id,
        String studentId,
        String studentName,
        String studentEmail,
        String text,
        String fileName,
        String fileUrl,
        long fileSize,
        Instant submittedAt,
        String status,
        Integer marks,
        String feedback
) {
}
