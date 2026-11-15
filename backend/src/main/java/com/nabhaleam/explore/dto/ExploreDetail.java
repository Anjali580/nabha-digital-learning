package com.nabhaleam.explore.dto;

import com.nabhaleam.learningcontent.ContentDefinition;
import com.nabhaleam.learningcontent.ContentSection;
import com.nabhaleam.learningcontent.MediaRef;

import java.util.List;

public record ExploreDetail(
        String id,
        String slug,
        String title,
        String shortDescription,
        String categorySlug,
        String categoryTitle,
        String categoryIcon,
        String categoryColor,
        String coverImage,
        int readingTimeMinutes,
        List<ContentSection> sections,
        List<ContentDefinition> definitions,
        List<String> practicalExamples,
        List<MediaRef> images,
        List<MediaRef> videos,
        List<String> keyTakeaways,
        List<String> tags,
        List<ExploreSummary> related,
        String bookmarkId
) {
}
