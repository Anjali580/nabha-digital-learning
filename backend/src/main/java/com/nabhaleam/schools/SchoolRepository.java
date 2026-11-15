package com.nabhaleam.schools;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SchoolRepository extends MongoRepository<School, String> {

    List<School> findAllByOrderByNameAsc();
}
