package com.nabhaleam.explore;

import com.nabhaleam.learningcontent.ContentDefinition;
import com.nabhaleam.learningcontent.ContentSection;
import com.nabhaleam.learningcontent.MediaRef;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "exploreContents")
@CompoundIndex(name = "explore_category_published", def = "{'category': 1, 'published': 1}")
public class ExploreContent {

    @Id
    private String id;

    @Indexed(unique = true)
    private String slug;

    private String title;

    private String shortDescription;

    private String category;

    private String coverImage;

    private int readingTimeMinutes;

    @Builder.Default
    private List<ContentSection> sections = new ArrayList<>();

    @Builder.Default
    private List<ContentDefinition> definitions = new ArrayList<>();

    @Builder.Default
    private List<String> practicalExamples = new ArrayList<>();

    @Builder.Default
    private List<MediaRef> images = new ArrayList<>();

    @Builder.Default
    private List<MediaRef> videos = new ArrayList<>();

    @Builder.Default
    private List<String> keyTakeaways = new ArrayList<>();

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Builder.Default
    private List<String> relatedIds = new ArrayList<>();

    @Builder.Default
    private boolean published = true;

    @Builder.Default
    private boolean seeded = false;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
