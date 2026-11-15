package com.nabhaleam.quizzes;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "quizAttempts")
@CompoundIndex(name = "attempt_student_quiz", def = "{'studentId': 1, 'quizId': 1, 'startedAt': -1}")
public class QuizAttempt {

    @Id
    private String id;

    @Indexed
    private String studentId;

    @Indexed
    private String quizId;

    private String classId;

    private String subjectId;

    private AttemptStatus status;

    @Builder.Default
    private List<QuizAnswerRecord> answers = new ArrayList<>();

    @Builder.Default
    private int score = 0;

    @Builder.Default
    private int totalMarks = 0;

    @Builder.Default
    private double percentage = 0;

    @Builder.Default
    private int correctCount = 0;

    @Builder.Default
    private int incorrectCount = 0;

    @Builder.Default
    private int unansweredCount = 0;

    private Instant startedAt;

    private Instant submittedAt;

    private Long timeTakenSeconds;
}
