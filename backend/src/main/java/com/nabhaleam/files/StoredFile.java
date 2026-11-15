package com.nabhaleam.files;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "files")
public class StoredFile {

    @Id
    private String id;

    @Indexed
    private String ownerId;

    private String originalName;

    private String storedName;

    private String contentType;

    private long size;

    private FilePurpose purpose;

    @CreatedDate
    private Instant createdAt;
}
