package com.nabhaleam.quizzes.dto;

import java.util.List;

public record QuizQuestionView(
        String id,
        String type,
        String prompt,
        List<OptionView> options,
        int marks
) {
    public record OptionView(String key, String text) {
    }
}
