package com.nabhaleam.classes;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SchoolClassRepository extends MongoRepository<SchoolClass, String> {

    List<SchoolClass> findByActiveTrueOrderByLevelAsc();

    boolean existsByIdAndActiveTrue(String id);
}
