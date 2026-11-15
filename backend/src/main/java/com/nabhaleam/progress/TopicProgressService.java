package com.nabhaleam.progress;

import com.nabhaleam.common.ApiException;
import com.nabhaleam.progress.dto.ContinueLearningItem;
import com.nabhaleam.progress.dto.TopicCompletionResult;
import com.nabhaleam.subjects.Subject;
import com.nabhaleam.subjects.SubjectRepository;
import com.nabhaleam.topics.Topic;
import com.nabhaleam.topics.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TopicProgressService {

    private static final int MAX_RECENT_ACCESS = 40;

    private final StudentProgressRepository progressRepository;
    private final TopicRepository topicRepository;
    private final SubjectRepository subjectRepository;
    private final com.nabhaleam.chapters.ChapterRepository chapterRepository;

    public StudentProgress getOrCreate(String studentId) {
        return progressRepository.findByStudentId(studentId).orElseGet(() -> {
            try {
                return progressRepository.save(StudentProgress.builder()
                        .studentId(studentId)
                        .completedTopicIds(new ArrayList<>())
                        .completions(new ArrayList<>())
                        .recentAccess(new ArrayList<>())
                        .build());
            } catch (DuplicateKeyException ex) {
                return progressRepository.findByStudentId(studentId).orElseThrow();
            }
        });
    }

    public Set<String> completedTopicIds(String studentId) {
        return new HashSet<>(getOrCreate(studentId).getCompletedTopicIds());
    }

    public boolean isCompleted(String studentId, String topicId) {
        return getOrCreate(studentId).getCompletedTopicIds().contains(topicId);
    }

    public void recordAccess(String studentId, Topic topic) {
        StudentProgress progress = getOrCreate(studentId);
        List<StudentProgress.TopicAccess> accesses = progress.getRecentAccess() == null
                ? new ArrayList<>() : new ArrayList<>(progress.getRecentAccess());
        accesses.removeIf(a -> topic.getId().equals(a.getTopicId()));
        accesses.add(0, StudentProgress.TopicAccess.builder()
                .topicId(topic.getId())
                .subjectId(topic.getSubjectId())
                .accessedAt(Instant.now())
                .build());
        if (accesses.size() > MAX_RECENT_ACCESS) {
            accesses = new ArrayList<>(accesses.subList(0, MAX_RECENT_ACCESS));
        }
        progress.setRecentAccess(accesses);
        progressRepository.save(progress);
    }

    public TopicCompletionResult complete(String studentId, String studentClassId, Topic topic) {
        if (!topic.getClassId().equals(studentClassId)) {
            throw ApiException.badRequest("This topic belongs to a different class.");
        }
        StudentProgress progress = getOrCreate(studentId);
        Set<String> completed = new LinkedHashSet<>(progress.getCompletedTopicIds());
        boolean alreadyCompleted = completed.contains(topic.getId());
        Instant completedAt = Instant.now();

        if (!alreadyCompleted) {
            completed.add(topic.getId());
            progress.setCompletedTopicIds(new ArrayList<>(completed));
            List<StudentProgress.TopicCompletion> completions = progress.getCompletions() == null
                    ? new ArrayList<>() : new ArrayList<>(progress.getCompletions());
            completions.add(0, StudentProgress.TopicCompletion.builder()
                    .topicId(topic.getId())
                    .subjectId(topic.getSubjectId())
                    .completedAt(completedAt)
                    .build());
            progress.setCompletions(completions);
            progressRepository.save(progress);
        }

        int totalTopics = (int) topicRepository.countByClassIdAndActiveTrue(studentClassId);
        List<Topic> subjectTopics = topicRepository.findBySubjectIdAndActiveTrueOrderByOrderAsc(topic.getSubjectId());
        int subjectCompleted = (int) subjectTopics.stream()
                .map(Topic::getId)
                .filter(completed::contains)
                .count();
        Subject subject = subjectRepository.findById(topic.getSubjectId()).orElse(null);

        return new TopicCompletionResult(
                topic.getId(),
                completedAt,
                alreadyCompleted,
                completed.size(),
                totalTopics,
                percentage(completed.size(), totalTopics),
                subject == null ? topic.getSubjectId() : subject.getId(),
                subjectCompleted,
                subjectTopics.size(),
                percentage(subjectCompleted, subjectTopics.size()));
    }

    public List<ContinueLearningItem> continueLearning(String studentId, String classId) {
        StudentProgress progress = getOrCreate(studentId);
        List<StudentProgress.TopicAccess> accesses = progress.getRecentAccess() == null
                ? List.of() : progress.getRecentAccess();
        Set<String> completed = new HashSet<>(progress.getCompletedTopicIds());

        List<ContinueLearningItem> items = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (StudentProgress.TopicAccess access : accesses) {
            if (items.size() >= 5 || !seen.add(access.getTopicId())) {
                continue;
            }
            Topic topic = topicRepository.findByIdAndActiveTrue(access.getTopicId()).orElse(null);
            if (topic == null) {
                continue;
            }
            Subject subject = subjectRepository.findById(topic.getSubjectId()).orElse(null);
            items.add(new ContinueLearningItem(
                    topic.getId(), topic.getTitle(), topic.getSubjectId(),
                    subject == null ? "Subject" : subject.getName(),
                    subject == null ? "book" : subject.getIcon(),
                    subject == null ? "#0E9F6E" : subject.getColor(),
                    topic.getChapterId(), chapterTitle(topic), topic.getEstimatedMinutes(),
                    completed.contains(topic.getId()), access.getAccessedAt()));
        }

        // If the student has no history yet, suggest the first unfinished topics of their class.
        if (items.isEmpty()) {
            List<Topic> classTopics = topicRepository.findByClassIdAndActiveTrue(classId).stream()
                    .filter(t -> !completed.contains(t.getId()))
                    .sorted(Comparator.comparingInt(Topic::getOrder))
                    .limit(5)
                    .toList();
            for (Topic topic : classTopics) {
                Subject subject = subjectRepository.findById(topic.getSubjectId()).orElse(null);
                items.add(new ContinueLearningItem(
                        topic.getId(), topic.getTitle(), topic.getSubjectId(),
                        subject == null ? "Subject" : subject.getName(),
                        subject == null ? "book" : subject.getIcon(),
                        subject == null ? "#0E9F6E" : subject.getColor(),
                        topic.getChapterId(), chapterTitle(topic), topic.getEstimatedMinutes(), false, null));
            }
        }
        return items;
    }

    public static double percentage(long part, long whole) {
        if (whole <= 0) {
            return 0.0;
        }
        return Math.round((part * 10000.0) / whole) / 100.0;
    }

    private String chapterTitle(Topic topic) {
        return chapterRepository.findById(topic.getChapterId())
                .map(com.nabhaleam.chapters.Chapter::getTitle)
                .orElse("Chapter");
    }
}
