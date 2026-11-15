package com.nabhaleam.bookmarks.dto;

import com.nabhaleam.bookmarks.Bookmark;
import com.nabhaleam.bookmarks.BookmarkTargetType;

import java.time.Instant;

public record BookmarkDto(
        String id,
        BookmarkTargetType targetType,
        String targetId,
        String title,
        String subtitle,
        String link,
        Instant createdAt
) {
    public static BookmarkDto from(Bookmark bookmark) {
        return new BookmarkDto(bookmark.getId(), bookmark.getTargetType(), bookmark.getTargetId(),
                bookmark.getTitle(), bookmark.getSubtitle(), bookmark.getLink(), bookmark.getCreatedAt());
    }
}
