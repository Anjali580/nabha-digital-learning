package com.nabhaleam.bookmarks;

import com.nabhaleam.bookmarks.dto.BookmarkDto;
import com.nabhaleam.bookmarks.dto.CreateBookmarkRequest;
import com.nabhaleam.common.ApiException;
import com.nabhaleam.explore.ExploreContent;
import com.nabhaleam.explore.ExploreContentRepository;
import com.nabhaleam.subjects.Subject;
import com.nabhaleam.subjects.SubjectRepository;
import com.nabhaleam.topics.Topic;
import com.nabhaleam.topics.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository repository;
    private final TopicRepository topicRepository;
    private final SubjectRepository subjectRepository;
    private final ExploreContentRepository exploreRepository;

    public List<BookmarkDto> list(String studentId, BookmarkTargetType type) {
        List<Bookmark> bookmarks = type == null
                ? repository.findByStudentIdOrderByCreatedAtDesc(studentId)
                : repository.findByStudentIdAndTargetTypeOrderByCreatedAtDesc(studentId, type);
        return bookmarks.stream().map(BookmarkDto::from).toList();
    }

    public BookmarkDto add(String studentId, CreateBookmarkRequest request) {
        Bookmark bookmark = switch (request.targetType()) {
            case TOPIC -> topicBookmark(studentId, request.targetId());
            case EXPLORE -> exploreBookmark(studentId, request.targetId());
        };
        try {
            return BookmarkDto.from(repository.save(bookmark));
        } catch (DuplicateKeyException ex) {
            throw ApiException.conflict("This item is already in your bookmarks.");
        }
    }

    public void delete(String studentId, String bookmarkId) {
        Bookmark bookmark = repository.findByIdAndStudentId(bookmarkId, studentId)
                .orElseThrow(() -> ApiException.notFound("Bookmark not found."));
        repository.delete(bookmark);
    }

    public String bookmarkIdFor(String studentId, BookmarkTargetType type, String targetId) {
        return repository.findByStudentIdAndTargetTypeAndTargetId(studentId, type, targetId)
                .map(Bookmark::getId)
                .orElse(null);
    }

    public Map<String, String> bookmarkIdsFor(String studentId, BookmarkTargetType type, Collection<String> ids) {
        if (studentId == null || ids == null || ids.isEmpty()) {
            return Map.of();
        }
        Map<String, String> result = new HashMap<>();
        repository.findByStudentIdAndTargetTypeAndTargetIdIn(studentId, type, ids)
                .forEach(b -> result.put(b.getTargetId(), b.getId()));
        return result;
    }

    public long count(String studentId) {
        return repository.countByStudentId(studentId);
    }

    public void deleteAllForStudent(String studentId) {
        repository.deleteByStudentId(studentId);
    }

    private Bookmark topicBookmark(String studentId, String topicId) {
        Topic topic = topicRepository.findByIdAndActiveTrue(topicId)
                .orElseThrow(() -> ApiException.notFound("Topic not found."));
        Subject subject = subjectRepository.findById(topic.getSubjectId()).orElse(null);
        return Bookmark.builder()
                .studentId(studentId)
                .targetType(BookmarkTargetType.TOPIC)
                .targetId(topic.getId())
                .title(topic.getTitle())
                .subtitle(subject == null ? "Academic topic" : subject.getName())
                .link("/app/learn/topics/" + topic.getId())
                .build();
    }

    private Bookmark exploreBookmark(String studentId, String contentId) {
        ExploreContent content = exploreRepository.findByIdAndPublishedTrue(contentId)
                .orElseThrow(() -> ApiException.notFound("Explore content not found."));
        return Bookmark.builder()
                .studentId(studentId)
                .targetType(BookmarkTargetType.EXPLORE)
                .targetId(content.getId())
                .title(content.getTitle())
                .subtitle("Explore · " + content.getReadingTimeMinutes() + " min read")
                .link("/app/explore/" + content.getSlug())
                .build();
    }
}
