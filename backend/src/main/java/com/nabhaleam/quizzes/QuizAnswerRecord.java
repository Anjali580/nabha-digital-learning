package com.nabhaleam.quizzes;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAnswerRecord {
    private String questionId;
    private String selectedOptionKey;
    private boolean correct;
    private int marksAwarded;
    private String topicId;
}
