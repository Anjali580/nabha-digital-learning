package com.nabhaleam.quizzes.dto;

import java.time.Instant;
import java.util.List;

public record QuizResult(
        String attemptId,
        String quizId,
        String quizTitle,
        String subjectName,
        int score,
        int totalMarks,
        double percentage,
        int correctCount,
        int incorrectCount,
        int unansweredCount,
        boolean passed,
        String performanceMessage,
        List<String> suggestions,
        Instant startedAt,
        Instant submittedAt,
        Long timeTakenSeconds,
        List<AnswerReview> answers
) {
    public record AnswerReview(
            String questionId,
            String prompt,
            String type,
            List<QuizQuestionView.OptionView> options,
            String selectedOptionKey,
            String correctOptionKey,
            boolean correct,
            String explanation,
            int marksAwarded,
            int marks,
            String topicId,
            String topicTitle
    ) {
    }
}
