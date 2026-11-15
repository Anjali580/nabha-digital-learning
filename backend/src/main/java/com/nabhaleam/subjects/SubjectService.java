package com.nabhaleam.subjects;

import com.nabhaleam.chapters.Chapter;
import com.nabhaleam.chapters.ChapterRepository;
import com.nabhaleam.chapters.dto.ChapterSummary;
import com.nabhaleam.classes.SchoolClassRepository;
import com.nabhaleam.common.ApiException;
import com.nabhaleam.progress.TopicProgressService;
import com.nabhaleam.security.SecurityUtils;
import com.nabhaleam.subjects.dto.SubjectDetail;
import com.nabhaleam.subjects.dto.SubjectDto;
import com.nabhaleam.topics.Topic;
import com.nabhaleam.topics.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final SchoolClassRepository classRepository;
    private final ChapterRepository chapterRepository;
    private final TopicRepository topicRepository;
    private final TopicProgressService progressService;

    public List<SubjectDto> listByClass(String classId) {
        if (classId == null || classId.isBlank() || !classRepository.existsByIdAndActiveTrue(classId)) {
            throw ApiException.notFound("Class not found.");
        }
        return subjectRepository.findByClassIdAndActiveTrueOrderByOrderAsc(classId).stream()
                .map(subject -> new SubjectDto(subject.getId(), subject.getClassId(), subject.getName(),
                        subject.getSlug(), subject.getDescription(), subject.getIcon(), subject.getColor(),
                        (int) chapterRepository.countBySubjectIdAndActiveTrue(subject.getId()),
                        (int) topicRepository.countBySubjectIdAndActiveTrue(subject.getId())))
                .toList();
    }

    public SubjectDetail detail(String id) {
        Subject subject = subjectRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> ApiException.notFound("Subject not found."));
        String studentId = SecurityUtils.currentUserIdOrNull();
        Set<String> completed = studentId == null ? Set.of() : progressService.completedTopicIds(studentId);

        List<Chapter> chapters = chapterRepository.findBySubjectIdAndActiveTrueOrderByOrderAsc(id);
        List<ChapterSummary> chapterSummaries = chapters.stream()
                .map(chapter -> {
                    List<Topic> topics = topicRepository.findByChapterIdAndActiveTrueOrderByOrderAsc(chapter.getId());
                    int completedCount = (int) topics.stream().map(Topic::getId).filter(completed::contains).count();
                    return new ChapterSummary(chapter.getId(), chapter.getTitle(), chapter.getDescription(),
                            chapter.getOrder(), topics.size(), completedCount);
                })
                .toList();

        List<Topic> subjectTopics = topicRepository.findBySubjectIdAndActiveTrueOrderByOrderAsc(id);
        int completedTopics = (int) subjectTopics.stream().map(Topic::getId).filter(completed::contains).count();
        double percentage = TopicProgressService.percentage(completedTopics, subjectTopics.size());

        return new SubjectDetail(subject.getId(), subject.getClassId(), subject.getName(), subject.getSlug(),
                subject.getDescription(), subject.getIcon(), subject.getColor(), chapters.size(),
                subjectTopics.size(), completedTopics, percentage, chapterSummaries);
    }
}
