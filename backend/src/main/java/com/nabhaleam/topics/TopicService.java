package com.nabhaleam.topics;

import com.nabhaleam.bookmarks.BookmarkService;
import com.nabhaleam.bookmarks.BookmarkTargetType;
import com.nabhaleam.chapters.Chapter;
import com.nabhaleam.chapters.ChapterRepository;
import com.nabhaleam.common.ApiException;
import com.nabhaleam.learningcontent.LearningContent;
import com.nabhaleam.learningcontent.LearningContentRepository;
import com.nabhaleam.learningcontent.dto.LearningContentDto;
import com.nabhaleam.progress.TopicProgressService;
import com.nabhaleam.subjects.Subject;
import com.nabhaleam.subjects.SubjectRepository;
import com.nabhaleam.topics.dto.TopicDetail;
import com.nabhaleam.topics.dto.TopicSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;
    private final ChapterRepository chapterRepository;
    private final SubjectRepository subjectRepository;
    private final LearningContentRepository contentRepository;
    private final TopicProgressService progressService;
    private final BookmarkService bookmarkService;

    public TopicDetail detail(String topicId, String studentId) {
        Topic topic = topicRepository.findByIdAndActiveTrue(topicId)
                .orElseThrow(() -> ApiException.notFound("Topic not found."));
        Chapter chapter = chapterRepository.findById(topic.getChapterId()).orElse(null);
        Subject subject = subjectRepository.findById(topic.getSubjectId()).orElse(null);
        LearningContent content = contentRepository.findByTopicId(topicId).orElse(null);

        boolean completed = studentId != null && progressService.isCompleted(studentId, topicId);
        String bookmarkId = studentId == null ? null
                : bookmarkService.bookmarkIdFor(studentId, BookmarkTargetType.TOPIC, topicId);

        List<Topic> chapterTopics = topicRepository.findByChapterIdAndActiveTrueOrderByOrderAsc(topic.getChapterId());
        int index = -1;
        for (int i = 0; i < chapterTopics.size(); i++) {
            if (chapterTopics.get(i).getId().equals(topicId)) {
                index = i;
                break;
            }
        }
        Topic previous = index > 0 ? chapterTopics.get(index - 1) : null;
        Topic next = index >= 0 && index < chapterTopics.size() - 1 ? chapterTopics.get(index + 1) : null;

        if (studentId != null) {
            progressService.recordAccess(studentId, topic);
        }

        return new TopicDetail(topic.getId(), topic.getChapterId(),
                chapter == null ? "Chapter" : chapter.getTitle(),
                topic.getSubjectId(), subject == null ? "Subject" : subject.getName(),
                subject == null ? "book" : subject.getIcon(),
                subject == null ? "#0E9F6E" : subject.getColor(),
                topic.getClassId(), topic.getTitle(), topic.getSummary(), topic.getOrder(),
                topic.getEstimatedMinutes(), completed, bookmarkId, LearningContentDto.from(content),
                previous == null ? null : previous.getId(), previous == null ? null : previous.getTitle(),
                next == null ? null : next.getId(), next == null ? null : next.getTitle(),
                relatedTopics(topic, content), topic.isSeeded());
    }

    private List<TopicSummary> relatedTopics(Topic topic, LearningContent content) {
        Set<String> ids = new LinkedHashSet<>();
        if (content != null && content.getRelatedTopicIds() != null) {
            ids.addAll(content.getRelatedTopicIds());
        }
        if (ids.size() < 3) {
            topicRepository.findBySubjectIdAndActiveTrueOrderByOrderAsc(topic.getSubjectId()).stream()
                    .filter(t -> !t.getId().equals(topic.getId()))
                    .forEach(t -> ids.add(t.getId()));
        }
        List<TopicSummary> result = new ArrayList<>();
        for (String id : ids) {
            if (result.size() >= 3) {
                break;
            }
            topicRepository.findByIdAndActiveTrue(id).ifPresent(related ->
                    result.add(new TopicSummary(related.getId(), related.getTitle(), related.getSummary(),
                            related.getOrder(), related.getEstimatedMinutes(), related.getChapterId(), false)));
        }
        return result;
    }
}
