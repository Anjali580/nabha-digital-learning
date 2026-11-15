package com.nabhaleam.dashboard;

import com.nabhaleam.progress.dto.ContinueLearningItem;
import com.nabhaleam.progress.dto.ProgressOverview;

import java.util.List;

public record DashboardResponse(
        String firstName,
        String className,
        String classId,
        ProgressOverview.OverallProgress overview,
        List<ContinueLearningItem> continueLearning,
        List<SubjectCard> subjects,
        List<RecommendedItem> recommended,
        List<ProgressOverview.HistoryItem> recentActivity,
        long unreadNotifications
) {
    public record SubjectCard(
            String id,
            String name,
            String description,
            String icon,
            String color,
            int chapterCount,
            int totalTopics,
            int completedTopics,
            double percentage
    ) {
    }

    public record RecommendedItem(
            String type,
            String id,
            String title,
            String subtitle,
            String reason,
            String icon,
            String color,
            String link,
            Integer readingTimeMinutes
    ) {
    }
}
