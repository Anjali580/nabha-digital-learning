package com.nabhaleam.quizzes.dto;

import java.time.Instant;

public record AttemptSummary(
        String attemptId,
        String quizId,
        String quizTitle,
        String subjectName,
        String status,
        int score,
        int totalMarks,
        double percentage,
        int correctCount,
        int incorrectCount,
        int unansweredCount,
        Instant submittedAt,
        Long timeTakenSeconds
) {
}
