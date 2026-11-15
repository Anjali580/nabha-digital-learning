package com.nabhaleam.chapters;

import com.nabhaleam.chapters.dto.ChapterDetail;
import com.nabhaleam.chapters.dto.ChapterSummary;
import com.nabhaleam.common.ApiException;
import com.nabhaleam.progress.TopicProgressService;
import com.nabhaleam.security.SecurityUtils;
import com.nabhaleam.subjects.Subject;
import com.nabhaleam.subjects.SubjectRepository;
import com.nabhaleam.topics.Topic;
import com.nabhaleam.topics.TopicRepository;
import com.nabhaleam.topics.dto.TopicSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ChapterService {

    private final ChapterRepository chapterRepository;
    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;
    private final TopicProgressService progressService;

    public ChapterDetail detail(String chapterId) {
        Chapter chapter = chapterRepository.findByIdAndActiveTrue(chapterId)
                .orElseThrow(() -> ApiException.notFound("Chapter not found."));
        Subject subject = subjectRepository.findById(chapter.getSubjectId()).orElse(null);
        String studentId = SecurityUtils.currentUserIdOrNull();
        Set<String> completed = studentId == null ? Set.of() : progressService.completedTopicIds(studentId);

        List<Topic> topics = topicRepository.findByChapterIdAndActiveTrueOrderByOrderAsc(chapterId);
        List<TopicSummary> summaries = topics.stream()
                .map(topic -> new TopicSummary(topic.getId(), topic.getTitle(), topic.getSummary(),
                        topic.getOrder(), topic.getEstimatedMinutes(), topic.getChapterId(),
                        completed.contains(topic.getId())))
                .toList();
        int completedCount = (int) summaries.stream().filter(TopicSummary::completed).count();

        return new ChapterDetail(chapter.getId(), chapter.getTitle(), chapter.getDescription(),
                chapter.getOrder(), chapter.getSubjectId(),
                subject == null ? "Subject" : subject.getName(),
                subject == null ? "#0E9F6E" : subject.getColor(),
                chapter.getClassId(), summaries.size(), completedCount, summaries);
    }

    public List<TopicSummary> topics(String chapterId) {
        return detail(chapterId).topics();
    }

    public List<ChapterSummary> summariesForSubject(String subjectId) {
        List<Chapter> chapters = chapterRepository.findBySubjectIdAndActiveTrueOrderByOrderAsc(subjectId);
        return chapters.stream()
                .map(chapter -> new ChapterSummary(chapter.getId(), chapter.getTitle(), chapter.getDescription(),
                        chapter.getOrder(),
                        (int) topicRepository.countByChapterIdAndActiveTrue(chapter.getId()), 0))
                .toList();
    }
}
