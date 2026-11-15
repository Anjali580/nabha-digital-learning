package com.nabhaleam.contact;

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
@Document(collection = "contactMessages")
public class ContactMessage {

    @Id
    private String id;

    private String name;

    @Indexed
    private String email;

    private String subject;

    private String message;

    private String topic;

    @CreatedDate
    private Instant createdAt;
}
