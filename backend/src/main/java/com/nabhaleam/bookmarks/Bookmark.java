package com.nabhaleam.bookmarks;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookmarks")
@CompoundIndex(name = "bookmark_unique", def = "{'studentId': 1, 'targetType': 1, 'targetId': 1}", unique = true)
public class Bookmark {

    @Id
    private String id;

    @Indexed
    private String studentId;

    private BookmarkTargetType targetType;

    private String targetId;

    private String title;

    private String subtitle;

    private String link;

    @CreatedDate
    private Instant createdAt;
}
