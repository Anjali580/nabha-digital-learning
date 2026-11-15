package com.nabhaleam.explore.dto;

import java.util.List;

public record ExploreSummary(
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
        List<String> tags,
        String bookmarkId
) {
}
