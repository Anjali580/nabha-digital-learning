package com.nabhaleam.files;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface StoredFileRepository extends MongoRepository<StoredFile, String> {

    List<StoredFile> findByOwnerId(String ownerId);
}
