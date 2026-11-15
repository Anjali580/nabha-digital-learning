package com.nabhaleam.quizzes.dto;

import java.util.List;

public record QuizDetail(
        QuizSummary summary,
        List<String> instructions
) {
}
