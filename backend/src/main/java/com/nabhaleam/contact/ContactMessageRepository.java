package com.nabhaleam.contact;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;

public interface ContactMessageRepository extends MongoRepository<ContactMessage, String> {

    long countByEmailIgnoreCaseAndCreatedAtAfter(String email, Instant since);
}
