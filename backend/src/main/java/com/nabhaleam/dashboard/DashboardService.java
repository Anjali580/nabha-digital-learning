package com.nabhaleam.dashboard;

import com.nabhaleam.chapters.ChapterRepository;
import com.nabhaleam.explore.ExploreContent;
import com.nabhaleam.explore.ExploreContentRepository;
import com.nabhaleam.notifications.NotificationService;
import com.nabhaleam.progress.ProgressAnalyticsService;
import com.nabhaleam.progress.TopicProgressService;
import com.nabhaleam.progress.dto.ProgressOverview;
import com.nabhaleam.subjects.Subject;
import com.nabhaleam.subjects.SubjectRepository;
import com.nabhaleam.topics.Topic;
import com.nabhaleam.topics.TopicRepository;
import com.nabhaleam.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProgressAnalyticsService analyticsService;
    private final TopicProgressService topicProgressService;
    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;
    private final ChapterRepository chapterRepository;
    private final ExploreContentRepository exploreRepository;
    private final NotificationService notificationService;

    public DashboardResponse dashboard(User student) {
        ProgressOverview progress = analyticsService.overview(student);
        Set<String> completed = new HashSet<>(topicProgressService.completedTopicIds(student.getId()));

        List<DashboardResponse.SubjectCard> subjectCards = progress.subjects().stream()
                .map(subject -> new DashboardResponse.SubjectCard(
                        subject.subjectId(), subject.name(), subject.description(), subject.icon(),
                        subject.color(), subject.chapterCount(), subject.totalTopics(),
                        subject.completedTopics(), subject.percentage()))
                .toList();

        List<DashboardResponse.RecommendedItem> recommended = new ArrayList<>();
        progress.subjects().stream()
                .sorted(Comparator.comparingDouble(ProgressOverview.SubjectProgress::percentage))
                .limit(3)
                .forEach(subject -> {
                    if (recommended.size() >= 3) {
                        return;
                    }
                    topicRepository.findBySubjectIdAndActiveTrueOrderByOrderAsc(subject.subjectId()).stream()
                            .filter(topic -> !completed.contains(topic.getId()))
                            .findFirst()
                            .ifPresent(topic -> recommended.add(new DashboardResponse.RecommendedItem(
                                    "TOPIC", topic.getId(), topic.getTitle(),
                                    chapterRepository.findById(topic.getChapterId())
                                            .map(com.nabhaleam.chapters.Chapter::getTitle).orElse(subject.name()),
                                    subject.percentage() < 50
                                            ? "Strengthen " + subject.name()
                                            : "Next step in " + subject.name(),
                                    subject.icon(), subject.color(),
                                    "/app/learn/topics/" + topic.getId(), topic.getEstimatedMinutes())));
                });

        List<ExploreContent> explore = exploreRepository.findAll().stream()
                .filter(ExploreContent::isPublished)
                .sorted(Comparator.comparing(ExploreContent::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(2)
                .toList();
        for (ExploreContent content : explore) {
            recommended.add(new DashboardResponse.RecommendedItem(
                    "EXPLORE", content.getId(), content.getTitle(), content.getShortDescription(),
                    "Beyond the book", "sparkles", "#8367E8",
                    "/app/explore/" + content.getSlug(), content.getReadingTimeMinutes()));
        }

        return new DashboardResponse(
                firstName(student.getFullName()),
                student.getClassName(),
                student.getClassId(),
                progress.overall(),
                topicProgressService.continueLearning(student.getId(), student.getClassId()),
                subjectCards,
                recommended.stream().limit(5).toList(),
                progress.recentActivity().stream().limit(8).toList(),
                notificationService.unreadCount(student.getId()));
    }

    private String firstName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "learner";
        }
        return fullName.trim().split("\\s+")[0];
    }
}
