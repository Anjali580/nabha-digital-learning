package com.nabhaleam.schools;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "schools")
public class School {

    @Id
    private String id;

    private String name;

    private String village;

    private String district;

    @Builder.Default
    private boolean demo = false;

    @CreatedDate
    private Instant createdAt;
}
