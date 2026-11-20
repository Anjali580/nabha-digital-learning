package com.nabhaleam.teacher.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public record CreateAssignmentRequest(
        @NotBlank(message = "Give the assignment a title.")
        @Size(max = 140, message = "Title must be 140 characters or fewer.")
        String title,

        @NotBlank(message = "Choose a class.")
        String classId,

        String subjectId,

        @Size(max = 1200, message = "Description is too long.")
        String description,

        List<String> instructions,

        Instant dueDate,

        @Min(value = 1, message = "Maximum marks must be at least 1.")
        @Max(value = 100, message = "Maximum marks cannot exceed 100.")
        int maxMarks,

        Boolean published
) {
}
