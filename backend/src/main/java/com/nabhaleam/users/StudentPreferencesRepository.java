package com.nabhaleam.users;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface StudentPreferencesRepository extends MongoRepository<StudentPreferences, String> {

    Optional<StudentPreferences> findByStudentId(String studentId);
}
