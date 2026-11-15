package com.nabhaleam.notifications;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    Page<Notification> findByStudentIdOrderByCreatedAtDesc(String studentId, Pageable pageable);

    long countByStudentIdAndReadFalse(String studentId);

    Optional<Notification> findByIdAndStudentId(String id, String studentId);

    boolean existsByStudentIdAndDedupeKey(String studentId, String dedupeKey);

    void deleteByStudentId(String studentId);
}
