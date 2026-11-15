package com.nabhaleam.quizzes;

import com.nabhaleam.quizzes.dto.SubmitQuizRequest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class QuizEvaluationService {

    public Evaluation evaluate(Quiz quiz, List<SubmitQuizRequest.AnswerInput> submitted) {
        Map<String, String> selected = new HashMap<>();
        if (submitted != null) {
            for (SubmitQuizRequest.AnswerInput answer : submitted) {
                if (answer.questionId() != null) {
                    selected.put(answer.questionId(), answer.selectedOptionKey());
                }
            }
        }

        List<QuizAnswerRecord> records = new ArrayList<>();
        int score = 0;
        int correctCount = 0;
        int incorrectCount = 0;
        int unansweredCount = 0;

        for (QuizQuestion question : quiz.getQuestions()) {
            String choice = selected.get(question.getId());
            boolean answered = choice != null && !choice.isBlank();
            boolean correct = answered && isCorrect(question, choice);
            int marksAwarded = correct ? question.getMarks() : 0;

            if (!answered) {
                unansweredCount++;
            } else if (correct) {
                correctCount++;
            } else {
                incorrectCount++;
            }
            score += marksAwarded;
            records.add(QuizAnswerRecord.builder()
                    .questionId(question.getId())
                    .selectedOptionKey(answered ? choice : null)
                    .correct(correct)
                    .marksAwarded(marksAwarded)
                    .topicId(question.getTopicId())
                    .build());
        }

        int totalMarks = quiz.getQuestions().stream().mapToInt(QuizQuestion::getMarks).sum();
        double percentage = totalMarks == 0 ? 0
                : Math.round((score * 10000.0) / totalMarks) / 100.0;

        return new Evaluation(records, score, totalMarks, percentage, correctCount, incorrectCount, unansweredCount);
    }

    private boolean isCorrect(QuizQuestion question, String choice) {
        return question.getCorrectOptionKey() != null
                && question.getCorrectOptionKey().equalsIgnoreCase(choice);
    }

    public record Evaluation(
            List<QuizAnswerRecord> answers,
            int score,
            int totalMarks,
            double percentage,
            int correctCount,
            int incorrectCount,
            int unansweredCount
    ) {
    }
}
