package com.nabhaleam.bookmarks.dto;

import com.nabhaleam.bookmarks.BookmarkTargetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateBookmarkRequest(
        @NotNull(message = "Bookmark type is required.")
        BookmarkTargetType targetType,

        @NotBlank(message = "Bookmark target is required.")
        String targetId
) {
}
