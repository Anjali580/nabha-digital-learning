package com.nabhaleam.explore.dto;

import com.nabhaleam.explore.ExploreCategory;

public record ExploreCategoryDto(
        String slug,
        String title,
        String description,
        String icon,
        String color,
        long count
) {
    public static ExploreCategoryDto from(ExploreCategory category, long count) {
        return new ExploreCategoryDto(category.getSlug(), category.getTitle(), category.getDescription(),
                category.getIcon(), category.getColor(), count);
    }
}
