package com.nabhaleam.quizzes.dto;

import java.time.Instant;
import java.util.List;

public record QuizStartResponse(
        String attemptId,
        String quizId,
        String title,
        Instant startedAt,
        int durationMinutes,
        int totalMarks,
        boolean resumed,
        List<QuizQuestionView> questions
) {
}
