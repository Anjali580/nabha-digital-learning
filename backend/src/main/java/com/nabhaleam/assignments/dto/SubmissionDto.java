package com.nabhaleam.assignments.dto;

import java.time.Instant;

public record SubmissionDto(
        String id,
        String assignmentId,
        String text,
        String fileId,
        String fileName,
        String fileUrl,
        long fileSize,
        Instant submittedAt,
        String status,
        Integer marks,
        String feedback,
        Instant reviewedAt
) {
}
