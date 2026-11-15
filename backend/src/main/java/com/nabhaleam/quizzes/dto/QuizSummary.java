package com.nabhaleam.quizzes.dto;

import java.time.Instant;

public record QuizSummary(
        String id,
        String title,
        String description,
        String classId,
        String subjectId,
        String subjectName,
        String subjectIcon,
        String subjectColor,
        String chapterId,
        int questionCount,
        int totalMarks,
        int durationMinutes,
        long attempts,
        Double bestPercentage,
        Instant lastAttemptAt
) {
}
