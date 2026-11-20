package com.nabhaleam.teacher.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReviewSubmissionRequest(
        @NotNull(message = "Enter the marks awarded.")
        @Min(value = 0, message = "Marks cannot be negative.")
        Integer marks,

        @Size(max = 1000, message = "Feedback must be 1000 characters or fewer.")
        String feedback
) {
}
