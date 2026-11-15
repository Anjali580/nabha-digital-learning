package com.nabhaleam.assignments.dto;

import java.util.List;

public record AssignmentDetail(
        AssignmentSummary summary,
        List<String> instructions,
        List<AttachmentDto> attachments,
        SubmissionDto submission,
        boolean canSubmit
) {
    public record AttachmentDto(String name, String url, String contentType) {
    }
}
