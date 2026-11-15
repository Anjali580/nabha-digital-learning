package com.nabhaleam.explore;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ExploreContentRepository extends MongoRepository<ExploreContent, String> {

    Optional<ExploreContent> findBySlugAndPublishedTrue(String slug);

    Optional<ExploreContent> findByIdAndPublishedTrue(String id);

    List<ExploreContent> findByIdInAndPublishedTrue(Collection<String> ids);

    long countByCategoryAndPublishedTrue(String category);

    long countByPublishedTrue();
}
