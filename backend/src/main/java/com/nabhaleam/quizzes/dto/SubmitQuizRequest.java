package com.nabhaleam.quizzes.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record SubmitQuizRequest(
        @NotBlank(message = "Attempt id is required.")
        String attemptId,

        @NotNull(message = "Answers are required.")
        List<@Valid AnswerInput> answers
) {
    public record AnswerInput(
            @NotBlank(message = "Question id is required.")
            String questionId,
            String selectedOptionKey
    ) {
    }
}
