package com.nabhaleam.progress;

import com.nabhaleam.assignments.AssignmentRepository;
import com.nabhaleam.assignments.AssignmentSubmission;
import com.nabhaleam.assignments.AssignmentSubmissionRepository;
import com.nabhaleam.assignments.SubmissionStatus;
import com.nabhaleam.bookmarks.BookmarkService;
import com.nabhaleam.chapters.ChapterRepository;
import com.nabhaleam.progress.dto.ProgressOverview;
import com.nabhaleam.quizzes.AttemptStatus;
import com.nabhaleam.quizzes.Quiz;
import com.nabhaleam.quizzes.QuizAnswerRecord;
import com.nabhaleam.quizzes.QuizAttempt;
import com.nabhaleam.quizzes.QuizAttemptRepository;
import com.nabhaleam.quizzes.QuizRepository;
import com.nabhaleam.subjects.Subject;
import com.nabhaleam.subjects.SubjectRepository;
import com.nabhaleam.topics.Topic;
import com.nabhaleam.topics.TopicRepository;
import com.nabhaleam.users.StudentPreferences;
import com.nabhaleam.users.StudentPreferencesRepository;
import com.nabhaleam.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProgressAnalyticsService {

    public static final ZoneId SCHOOL_ZONE = ZoneId.of("Asia/Kolkata");

    private final StudentProgressRepository progressRepository;
    private final TopicRepository topicRepository;
    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final QuizAttemptRepository attemptRepository;
    private final QuizRepository quizRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentPreferencesRepository preferencesRepository;
    private final BookmarkService bookmarkService;

    public ProgressOverview overview(User student) {
        StudentProgress progress = progressRepository.findByStudentId(student.getId())
                .orElseGet(() -> StudentProgress.builder()
                        .studentId(student.getId())
                        .completedTopicIds(new ArrayList<>())
                        .completions(new ArrayList<>())
                        .recentAccess(new ArrayList<>())
                        .build());
        Set<String> completed = new HashSet<>(progress.getCompletedTopicIds());

        int totalTopics = (int) topicRepository.countByClassIdAndActiveTrue(student.getClassId());
        int completedTopics = (int) completed.stream()
                .filter(id -> topicRepository.findByIdAndActiveTrue(id)
                        .map(topic -> student.getClassId().equals(topic.getClassId()))
                        .orElse(false))
                .count();

        List<QuizAttempt> attempts = attemptRepository
                .findByStudentIdAndStatusOrderBySubmittedAtDesc(student.getId(), AttemptStatus.SUBMITTED);
        double average = attempts.stream().mapToDouble(QuizAttempt::getPercentage).average().orElse(0);
        Double best = attempts.stream().mapToDouble(QuizAttempt::getPercentage).max().orElse(0);
        if (attempts.isEmpty()) {
            best = null;
        }

        long assignmentsCompleted = submissionRepository.countByStudentIdAndStatusIn(student.getId(),
                List.of(SubmissionStatus.SUBMITTED, SubmissionStatus.UNDER_REVIEW,
                        SubmissionStatus.REVIEWED, SubmissionStatus.LATE));
        long assignmentsTotal = assignmentRepository.countByClassIdAndPublishedTrue(student.getClassId());
        int assignmentsPending = (int) Math.max(0, assignmentsTotal - assignmentsCompleted);

        StudentPreferences preferences = preferencesRepository.findByStudentId(student.getId()).orElse(null);
        int dailyGoal = preferences == null ? 2 : Math.max(1, preferences.getDailyGoalTopics());
        int todayCompleted = countTodayCompletions(progress);

        ProgressOverview.OverallProgress overall = new ProgressOverview.OverallProgress(
                completedTopics, totalTopics, TopicProgressService.percentage(completedTopics, totalTopics),
                attempts.size(), Math.round(average * 100.0) / 100.0, best,
                (int) assignmentsCompleted, assignmentsPending, (int) bookmarkService.count(student.getId()),
                dailyGoal, todayCompleted, calculateStreak(progress));

        return new ProgressOverview(overall, subjectProgress(student, completed), quizPerformance(attempts),
                weakTopics(student.getId()), history(student.getId(), 30));
    }

    public List<ProgressOverview.SubjectProgress> subjectProgress(User student) {
        StudentProgress progress = progressRepository.findByStudentId(student.getId())
                .orElseGet(() -> StudentProgress.builder()
                        .studentId(student.getId()).completedTopicIds(new ArrayList<>()).build());
        return subjectProgress(student, new HashSet<>(progress.getCompletedTopicIds()));
    }

    private List<ProgressOverview.SubjectProgress> subjectProgress(User student, Set<String> completed) {
        List<Subject> subjects = subjectRepository.findByClassIdAndActiveTrueOrderByOrderAsc(student.getClassId());
        List<ProgressOverview.SubjectProgress> result = new ArrayList<>();
        for (Subject subject : subjects) {
            List<Topic> topics = topicRepository.findBySubjectIdAndActiveTrueOrderByOrderAsc(subject.getId());
            int done = (int) topics.stream().map(Topic::getId).filter(completed::contains).count();
            result.add(new ProgressOverview.SubjectProgress(
                    subject.getId(), subject.getName(), subject.getSlug(), subject.getDescription(),
                    subject.getIcon(), subject.getColor(),
                    (int) chapterRepository.countBySubjectIdAndActiveTrue(subject.getId()),
                    topics.size(), done, TopicProgressService.percentage(done, topics.size())));
        }
        return result;
    }

    public ProgressOverview.QuizPerformance quizPerformance(String studentId) {
        List<QuizAttempt> attempts = attemptRepository
                .findByStudentIdAndStatusOrderBySubmittedAtDesc(studentId, AttemptStatus.SUBMITTED);
        return quizPerformance(attempts);
    }

    private ProgressOverview.QuizPerformance quizPerformance(List<QuizAttempt> attempts) {
        double average = attempts.stream().mapToDouble(QuizAttempt::getPercentage).average().orElse(0);
        Double best = attempts.isEmpty() ? null
                : attempts.stream().mapToDouble(QuizAttempt::getPercentage).max().orElse(0);
        Map<String, Quiz> quizzes = new HashMap<>();
        quizRepository.findAllById(attempts.stream().map(QuizAttempt::getQuizId).distinct().toList())
                .forEach(quiz -> quizzes.put(quiz.getId(), quiz));
        List<ProgressOverview.RecentAttempt> recent = attempts.stream()
                .limit(5)
                .map(attempt -> new ProgressOverview.RecentAttempt(
                        attempt.getId(), attempt.getQuizId(),
                        quizzes.containsKey(attempt.getQuizId())
                                ? quizzes.get(attempt.getQuizId()).getTitle() : "Quiz",
                        attempt.getPercentage(), attempt.getScore(), attempt.getTotalMarks(),
                        attempt.getSubmittedAt()))
                .toList();
        return new ProgressOverview.QuizPerformance(attempts.size(),
                Math.round(average * 100.0) / 100.0, best, recent);
    }

    public List<ProgressOverview.WeakTopic> weakTopics(String studentId) {
        List<QuizAttempt> attempts = attemptRepository
                .findByStudentIdAndStatusOrderBySubmittedAtDesc(studentId, AttemptStatus.SUBMITTED);

        Map<String, TopicStats> stats = new HashMap<>();
        for (QuizAttempt attempt : attempts) {
            Set<String> topicsInAttempt = new HashSet<>();
            for (QuizAnswerRecord answer : attempt.getAnswers()) {
                if (answer.getTopicId() == null || answer.getSelectedOptionKey() == null) {
                    continue;
                }
                TopicStats topicStats = stats.computeIfAbsent(answer.getTopicId(), TopicStats::new);
                topicStats.answered++;
                if (answer.isCorrect()) {
                    topicStats.correct++;
                }
                if (topicsInAttempt.add(answer.getTopicId())) {
                    topicStats.attempts++;
                }
            }
        }

        List<ProgressOverview.WeakTopic> weak = new ArrayList<>();
        for (TopicStats value : stats.values()) {
            if (value.answered < 2) {
                continue;
            }
            double accuracy = Math.round((value.correct * 10000.0) / value.answered) / 100.0;
            if (accuracy >= 60) {
                continue;
            }
            Topic topic = topicRepository.findById(value.topicId).orElse(null);
            if (topic == null) {
                continue;
            }
            Subject subject = subjectRepository.findById(topic.getSubjectId()).orElse(null);
            weak.add(new ProgressOverview.WeakTopic(topic.getId(), topic.getTitle(),
                    subject == null ? "Subject" : subject.getName(), value.answered, value.correct,
                    accuracy, value.attempts));
        }
        weak.sort(Comparator.comparingDouble(ProgressOverview.WeakTopic::accuracy)
                .thenComparing(Comparator.comparingInt(ProgressOverview.WeakTopic::questionsAnswered).reversed()));
        return weak.stream().limit(10).toList();
    }

    public List<ProgressOverview.HistoryItem> history(String studentId, int limit) {
        List<ProgressOverview.HistoryItem> items = new ArrayList<>();
        progressRepository.findByStudentId(studentId).ifPresent(progress -> {
            Set<String> completed = new HashSet<>(progress.getCompletedTopicIds());
            for (StudentProgress.TopicCompletion completion : progress.getCompletions()) {
                Topic topic = topicRepository.findById(completion.getTopicId()).orElse(null);
                if (topic == null) {
                    continue;
                }
                Subject subject = subjectRepository.findById(topic.getSubjectId()).orElse(null);
                items.add(new ProgressOverview.HistoryItem("TOPIC_COMPLETED", topic.getTitle(),
                        "Completed in " + (subject == null ? "Subject" : subject.getName()),
                        "/app/learn/topics/" + topic.getId(), "check", "#0E9F6E", completion.getCompletedAt()));
            }
            for (StudentProgress.TopicAccess access : progress.getRecentAccess()) {
                if (completed.contains(access.getTopicId())) {
                    continue;
                }
                Topic topic = topicRepository.findById(access.getTopicId()).orElse(null);
                if (topic == null) {
                    continue;
                }
                Subject subject = subjectRepository.findById(topic.getSubjectId()).orElse(null);
                items.add(new ProgressOverview.HistoryItem("TOPIC_VIEWED", topic.getTitle(),
                        "Studied in " + (subject == null ? "Subject" : subject.getName()),
                        "/app/learn/topics/" + topic.getId(), "book", "#4F7DF3", access.getAccessedAt()));
            }
        });

        List<QuizAttempt> attempts = attemptRepository
                .findByStudentIdAndStatusOrderBySubmittedAtDesc(studentId, AttemptStatus.SUBMITTED)
                .stream().limit(15).toList();
        Map<String, Quiz> quizzes = new HashMap<>();
        quizRepository.findAllById(attempts.stream().map(QuizAttempt::getQuizId).toList())
                .forEach(quiz -> quizzes.put(quiz.getId(), quiz));
        for (QuizAttempt attempt : attempts) {
            Quiz quiz = quizzes.get(attempt.getQuizId());
            items.add(new ProgressOverview.HistoryItem("QUIZ_ATTEMPT",
                    quiz == null ? "Quiz attempt" : quiz.getTitle(),
                    "Scored " + attempt.getScore() + "/" + attempt.getTotalMarks()
                            + " (" + attempt.getPercentage() + "%)",
                    "/app/quizzes/results/" + attempt.getId(), "quiz", "#8367E8", attempt.getSubmittedAt()));
        }

        List<AssignmentSubmission> submissions = submissionRepository
                .findByStudentIdOrderBySubmittedAtDesc(studentId).stream().limit(15).toList();
        for (AssignmentSubmission submission : submissions) {
            items.add(new ProgressOverview.HistoryItem("ASSIGNMENT_SUBMITTED",
                    "Assignment submitted", "Status: " + pretty(submission.getStatus().name()),
                    "/app/assignments/" + submission.getAssignmentId(), "assignment", "#F2994A",
                    submission.getSubmittedAt()));
        }

        return items.stream()
                .filter(item -> item.occurredAt() != null)
                .sorted(Comparator.comparing(ProgressOverview.HistoryItem::occurredAt).reversed())
                .limit(limit)
                .toList();
    }

    private int countTodayCompletions(StudentProgress progress) {
        LocalDate today = LocalDate.now(SCHOOL_ZONE);
        return (int) progress.getCompletions().stream()
                .filter(completion -> completion.getCompletedAt() != null)
                .filter(completion -> completion.getCompletedAt().atZone(SCHOOL_ZONE).toLocalDate().equals(today))
                .count();
    }

    private int calculateStreak(StudentProgress progress) {
        Set<LocalDate> days = new HashSet<>();
        progress.getCompletions().forEach(completion -> {
            if (completion.getCompletedAt() != null) {
                days.add(completion.getCompletedAt().atZone(SCHOOL_ZONE).toLocalDate());
            }
        });
        LocalDate cursor = LocalDate.now(SCHOOL_ZONE);
        if (!days.contains(cursor)) {
            cursor = cursor.minusDays(1);
        }
        int streak = 0;
        while (days.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private String pretty(String status) {
        String lower = status.toLowerCase(Locale.ROOT).replace('_', ' ');
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }

    private static final class TopicStats {
        private final String topicId;
        private int answered;
        private int correct;
        private int attempts;

        private TopicStats(String topicId) {
            this.topicId = topicId;
        }
    }
}
