package com.nabhaleam.quizzes;

import com.nabhaleam.common.ApiException;
import com.nabhaleam.common.PageResponse;
import com.nabhaleam.quizzes.dto.*;
import com.nabhaleam.subjects.Subject;
import com.nabhaleam.subjects.SubjectRepository;
import com.nabhaleam.topics.Topic;
import com.nabhaleam.topics.TopicRepository;
import com.nabhaleam.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class QuizService {

    private static final Duration SUBMIT_GRACE = Duration.ofMinutes(2);

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository attemptRepository;
    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;
    private final QuizEvaluationService evaluationService;

    public List<QuizSummary> listForStudent(User student, String subjectId) {
        List<Quiz> quizzes = subjectId == null || subjectId.isBlank()
                ? quizRepository.findByPublishedTrueAndClassId(student.getClassId())
                : quizRepository.findByPublishedTrueAndClassIdAndSubjectId(student.getClassId(), subjectId);
        Map<String, Subject> subjects = subjectCache(quizzes);
        Map<String, AttemptStats> stats = attemptStats(student.getId());
        return quizzes.stream()
                .sorted(Comparator.comparing(Quiz::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(quiz -> toSummary(quiz, subjects.get(quiz.getSubjectId()), stats.get(quiz.getId())))
                .toList();
    }

    public QuizDetail detail(User student, String quizId) {
        Quiz quiz = requireQuizForStudent(student, quizId);
        Map<String, Subject> subjects = subjectCache(List.of(quiz));
        AttemptStats stats = attemptStats(student.getId()).get(quizId);
        List<String> instructions = List.of(
                "This quiz has " + quiz.getQuestions().size() + " questions worth "
                        + quiz.getTotalMarks() + " marks in total.",
                "You have " + quiz.getDurationMinutes() + " minutes. The quiz is submitted automatically when time runs out.",
                "Every question has one correct option. Unanswered questions score zero.",
                "Your answers are checked on the server after you submit. Correct answers are shown in your result.",
                "You may retry this quiz to improve your score.");
        return new QuizDetail(toSummary(quiz, subjects.get(quiz.getSubjectId()), stats), instructions);
    }

    public QuizStartResponse start(User student, String quizId) {
        Quiz quiz = requireQuizForStudent(student, quizId);

        QuizAttempt existing = attemptRepository
                .findFirstByStudentIdAndQuizIdAndStatusOrderByStartedAtDesc(
                        student.getId(), quizId, AttemptStatus.IN_PROGRESS)
                .orElse(null);
        if (existing != null) {
            if (!isExpired(existing, quiz)) {
                return startResponse(quiz, existing, true);
            }
            existing.setStatus(AttemptStatus.EXPIRED);
            attemptRepository.save(existing);
        }

        QuizAttempt attempt = attemptRepository.save(QuizAttempt.builder()
                .studentId(student.getId())
                .quizId(quiz.getId())
                .classId(quiz.getClassId())
                .subjectId(quiz.getSubjectId())
                .status(AttemptStatus.IN_PROGRESS)
                .startedAt(Instant.now())
                .totalMarks(quiz.getTotalMarks())
                .answers(new ArrayList<>())
                .build());

        return startResponse(quiz, attempt, false);
    }

    public QuizResult submit(User student, String quizId, SubmitQuizRequest request) {
        Quiz quiz = requireQuizForStudent(student, quizId);
        QuizAttempt attempt = attemptRepository.findByIdAndStudentId(request.attemptId(), student.getId())
                .orElseThrow(() -> ApiException.notFound("Quiz attempt not found."));
        if (!quiz.getId().equals(attempt.getQuizId())) {
            throw ApiException.badRequest("This attempt does not belong to the requested quiz.");
        }
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw ApiException.conflict("This quiz attempt has already been submitted.");
        }
        if (isExpired(attempt, quiz)) {
            attempt.setStatus(AttemptStatus.EXPIRED);
            attemptRepository.save(attempt);
            throw ApiException.badRequest("The time limit for this attempt has passed. Please start the quiz again.");
        }

        QuizEvaluationService.Evaluation evaluation = evaluationService.evaluate(quiz, request.answers());
        attempt.setAnswers(evaluation.answers());
        attempt.setScore(evaluation.score());
        attempt.setTotalMarks(evaluation.totalMarks());
        attempt.setPercentage(evaluation.percentage());
        attempt.setCorrectCount(evaluation.correctCount());
        attempt.setIncorrectCount(evaluation.incorrectCount());
        attempt.setUnansweredCount(evaluation.unansweredCount());
        attempt.setSubmittedAt(Instant.now());
        attempt.setTimeTakenSeconds(Math.max(0,
                Duration.between(attempt.getStartedAt(), attempt.getSubmittedAt()).getSeconds()));
        attempt.setStatus(AttemptStatus.SUBMITTED);
        attemptRepository.save(attempt);

        return buildResult(quiz, attempt);
    }

    public PageResponse<AttemptSummary> attempts(String studentId, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 30));
        Page<QuizAttempt> attempts = attemptRepository.findByStudentIdAndStatus(studentId,
                AttemptStatus.SUBMITTED, PageRequest.of(safePage, safeSize));
        Map<String, Quiz> quizzes = new HashMap<>();
        quizRepository.findAllById(attempts.getContent().stream().map(QuizAttempt::getQuizId).toList())
                .forEach(quiz -> quizzes.put(quiz.getId(), quiz));
        Map<String, Subject> subjects = subjectCache(new ArrayList<>(quizzes.values()));

        List<AttemptSummary> content = attempts.getContent().stream()
                .map(attempt -> {
                    Quiz quiz = quizzes.get(attempt.getQuizId());
                    Subject subject = quiz == null ? null : subjects.get(quiz.getSubjectId());
                    return new AttemptSummary(
                            attempt.getId(), attempt.getQuizId(),
                            quiz == null ? "Quiz" : quiz.getTitle(),
                            subject == null ? "Subject" : subject.getName(),
                            attempt.getStatus().name(), attempt.getScore(), attempt.getTotalMarks(),
                            attempt.getPercentage(), attempt.getCorrectCount(), attempt.getIncorrectCount(),
                            attempt.getUnansweredCount(), attempt.getSubmittedAt(), attempt.getTimeTakenSeconds());
                })
                .toList();

        return new PageResponse<>(content, safePage, safeSize, attempts.getTotalElements(),
                attempts.getTotalPages(), attempts.isLast());
    }

    public QuizResult attemptResult(String studentId, String attemptId) {
        QuizAttempt attempt = attemptRepository.findByIdAndStudentId(attemptId, studentId)
                .orElseThrow(() -> ApiException.notFound("Quiz attempt not found."));
        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
            throw ApiException.conflict("Finish the quiz before viewing its result.");
        }
        Quiz quiz = quizRepository.findById(attempt.getQuizId())
                .orElseThrow(() -> ApiException.notFound("This quiz is no longer available."));
        return buildResult(quiz, attempt);
    }

    private Quiz requireQuizForStudent(User student, String quizId) {
        Quiz quiz = quizRepository.findByIdAndPublishedTrue(quizId)
                .orElseThrow(() -> ApiException.notFound("Quiz not found."));
        if (!quiz.getClassId().equals(student.getClassId())) {
            throw ApiException.forbidden("This quiz is not available for your class.");
        }
        return quiz;
    }

    private boolean isExpired(QuizAttempt attempt, Quiz quiz) {
        if (attempt.getStartedAt() == null) {
            return true;
        }
        Instant deadline = attempt.getStartedAt()
                .plus(Duration.ofMinutes(Math.max(1, quiz.getDurationMinutes())))
                .plus(SUBMIT_GRACE);
        return Instant.now().isAfter(deadline);
    }

    private QuizStartResponse startResponse(Quiz quiz, QuizAttempt attempt, boolean resumed) {
        List<QuizQuestionView> questions = quiz.getQuestions().stream()
                .map(question -> new QuizQuestionView(
                        question.getId(), question.getType().name(), question.getPrompt(),
                        question.getOptions().stream()
                                .map(option -> new QuizQuestionView.OptionView(option.getKey(), option.getText()))
                                .toList(),
                        question.getMarks()))
                .toList();
        return new QuizStartResponse(attempt.getId(), quiz.getId(), quiz.getTitle(), attempt.getStartedAt(),
                quiz.getDurationMinutes(), quiz.getTotalMarks(), resumed, questions);
    }

    private QuizResult buildResult(Quiz quiz, QuizAttempt attempt) {
        Map<String, QuizQuestion> questions = new HashMap<>();
        quiz.getQuestions().forEach(question -> questions.put(question.getId(), question));

        Set<String> topicIds = new LinkedHashSet<>();
        attempt.getAnswers().forEach(answer -> {
            if (answer.getTopicId() != null) {
                topicIds.add(answer.getTopicId());
            }
        });
        Map<String, Topic> topics = new HashMap<>();
        topicRepository.findAllById(topicIds).forEach(topic -> topics.put(topic.getId(), topic));

        List<QuizResult.AnswerReview> reviews = attempt.getAnswers().stream()
                .map(answer -> {
                    QuizQuestion question = questions.get(answer.getQuestionId());
                    if (question == null) {
                        return null;
                    }
                    Topic topic = answer.getTopicId() == null ? null : topics.get(answer.getTopicId());
                    return new QuizResult.AnswerReview(
                            question.getId(), question.getPrompt(), question.getType().name(),
                            question.getOptions().stream()
                                    .map(option -> new QuizQuestionView.OptionView(option.getKey(), option.getText()))
                                    .toList(),
                            answer.getSelectedOptionKey(), question.getCorrectOptionKey(), answer.isCorrect(),
                            question.getExplanation(), answer.getMarksAwarded(), question.getMarks(),
                            answer.getTopicId(), topic == null ? null : topic.getTitle());
                })
                .filter(java.util.Objects::nonNull)
                .toList();

        Subject subject = subjectRepository.findById(quiz.getSubjectId()).orElse(null);
        boolean passed = attempt.getPercentage() >= 40;
        List<String> suggestions = suggestions(attempt, reviews, topics);
        String message = attempt.getPercentage() >= 80
                ? "Excellent work! You have a strong understanding of this chapter."
                : attempt.getPercentage() >= 40
                ? "Good effort. Review the questions you missed and try again to improve."
                : "Keep going. Revise the topic notes and retry this quiz when you feel ready.";

        return new QuizResult(attempt.getId(), quiz.getId(), quiz.getTitle(),
                subject == null ? "Subject" : subject.getName(), attempt.getScore(), attempt.getTotalMarks(),
                attempt.getPercentage(), attempt.getCorrectCount(), attempt.getIncorrectCount(),
                attempt.getUnansweredCount(), passed, message, suggestions, attempt.getStartedAt(),
                attempt.getSubmittedAt(), attempt.getTimeTakenSeconds(), reviews);
    }

    private List<String> suggestions(QuizAttempt attempt, List<QuizResult.AnswerReview> reviews,
                                     Map<String, Topic> topics) {
        List<String> suggestions = new ArrayList<>();
        Set<String> weakTopicTitles = new LinkedHashSet<>();
        reviews.stream()
                .filter(review -> !review.correct())
                .forEach(review -> {
                    if (review.topicTitle() != null) {
                        weakTopicTitles.add(review.topicTitle());
                    }
                });
        if (!weakTopicTitles.isEmpty()) {
            suggestions.add("Revise these topics: " + String.join(", ", weakTopicTitles) + ".");
        }
        if (attempt.getUnansweredCount() > 0) {
            suggestions.add("You left " + attempt.getUnansweredCount()
                    + " question(s) unanswered. Answer every question, even if you are unsure.");
        }
        if (attempt.getPercentage() < 80) {
            suggestions.add("Re-read the topic notes, then retry the quiz to strengthen your score.");
        } else {
            suggestions.add("Great accuracy. Explore a related Beyond-the-Book article to go deeper.");
        }
        return suggestions;
    }

    private QuizSummary toSummary(Quiz quiz, Subject subject, AttemptStats stats) {
        return new QuizSummary(quiz.getId(), quiz.getTitle(), quiz.getDescription(), quiz.getClassId(),
                quiz.getSubjectId(), subject == null ? "Subject" : subject.getName(),
                subject == null ? "quiz" : subject.getIcon(),
                subject == null ? "#0E9F6E" : subject.getColor(), quiz.getChapterId(),
                quiz.getQuestions().size(), quiz.getTotalMarks(), quiz.getDurationMinutes(),
                stats == null ? 0 : stats.attempts, stats == null ? null : stats.bestPercentage,
                stats == null ? null : stats.lastAttemptAt);
    }

    private Map<String, Subject> subjectCache(List<Quiz> quizzes) {
        Set<String> ids = new LinkedHashSet<>();
        quizzes.forEach(quiz -> ids.add(quiz.getSubjectId()));
        Map<String, Subject> subjects = new HashMap<>();
        subjectRepository.findAllById(ids).forEach(subject -> subjects.put(subject.getId(), subject));
        return subjects;
    }

    private Map<String, AttemptStats> attemptStats(String studentId) {
        Map<String, AttemptStats> stats = new HashMap<>();
        for (QuizAttempt attempt : attemptRepository.findByStudentIdAndStatusOrderBySubmittedAtDesc(
                studentId, AttemptStatus.SUBMITTED)) {
            AttemptStats current = stats.computeIfAbsent(attempt.getQuizId(), id -> new AttemptStats());
            current.attempts++;
            current.bestPercentage = current.bestPercentage == null
                    ? attempt.getPercentage()
                    : Math.max(current.bestPercentage, attempt.getPercentage());
            if (current.lastAttemptAt == null || (attempt.getSubmittedAt() != null
                    && attempt.getSubmittedAt().isAfter(current.lastAttemptAt))) {
                current.lastAttemptAt = attempt.getSubmittedAt();
            }
        }
        return stats;
    }

    private static final class AttemptStats {
        private long attempts;
        private Double bestPercentage;
        private Instant lastAttemptAt;
    }
}
