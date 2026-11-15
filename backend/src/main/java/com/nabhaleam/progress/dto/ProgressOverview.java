package com.nabhaleam.progress.dto;

import java.util.List;

public record ProgressOverview(
        OverallProgress overall,
        List<SubjectProgress> subjects,
        QuizPerformance quizPerformance,
        List<WeakTopic> weakTopics,
        List<HistoryItem> recentActivity
) {
    public record OverallProgress(
            int completedTopics,
            int totalTopics,
            double percentage,
            int quizzesAttempted,
            double averageQuizPercentage,
            Double bestQuizPercentage,
            int assignmentsCompleted,
            int assignmentsPending,
            int bookmarks,
            int dailyGoalTopics,
            int todayCompletedTopics,
            int streakDays
    ) {
    }

    public record SubjectProgress(
            String subjectId,
            String name,
            String slug,
            String description,
            String icon,
            String color,
            int chapterCount,
            int totalTopics,
            int completedTopics,
            double percentage
    ) {
    }

    public record QuizPerformance(
            int attempts,
            double averagePercentage,
            Double bestPercentage,
            List<RecentAttempt> recent
    ) {
    }

    public record RecentAttempt(
            String attemptId,
            String quizId,
            String quizTitle,
            double percentage,
            int score,
            int totalMarks,
            java.time.Instant submittedAt
    ) {
    }

    public record WeakTopic(
            String topicId,
            String title,
            String subjectName,
            int questionsAnswered,
            int correctAnswers,
            double accuracy,
            int attempts
    ) {
    }

    public record HistoryItem(
            String type,
            String title,
            String subtitle,
            String link,
            String icon,
            String color,
            java.time.Instant occurredAt
    ) {
    }
}
