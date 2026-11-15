package com.nabhaleam.bookmarks;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends MongoRepository<Bookmark, String> {

    List<Bookmark> findByStudentIdOrderByCreatedAtDesc(String studentId);

    List<Bookmark> findByStudentIdAndTargetTypeOrderByCreatedAtDesc(String studentId, BookmarkTargetType type);

    List<Bookmark> findByStudentIdAndTargetTypeAndTargetIdIn(String studentId, BookmarkTargetType type,
                                                            Collection<String> targetIds);

    Optional<Bookmark> findByStudentIdAndTargetTypeAndTargetId(String studentId, BookmarkTargetType type,
                                                               String targetId);

    Optional<Bookmark> findByIdAndStudentId(String id, String studentId);

    long countByStudentId(String studentId);

    void deleteByStudentId(String studentId);
}
