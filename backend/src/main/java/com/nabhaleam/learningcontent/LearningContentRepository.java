package com.nabhaleam.learningcontent;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface LearningContentRepository extends MongoRepository<LearningContent, String> {

    Optional<LearningContent> findByTopicId(String topicId);

    List<LearningContent> findByTopicIdIn(Collection<String> topicIds);
}
