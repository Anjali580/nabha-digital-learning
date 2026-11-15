package com.nabhaleam.quizzes;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestion {

    private String id;

    private QuestionType type;

    private String prompt;

    private String topicId;

    @Builder.Default
    private List<QuestionOption> options = new ArrayList<>();

    private String correctOptionKey;

    private String explanation;

    @Builder.Default
    private int marks = 1;
}
