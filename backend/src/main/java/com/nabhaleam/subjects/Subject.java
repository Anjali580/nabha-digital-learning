package com.nabhaleam.subjects;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "subjects")
@CompoundIndex(name = "subject_class_order", def = "{'classId': 1, 'order': 1}")
public class Subject {

    @Id
    private String id;

    private String classId;

    private String name;

    private String slug;

    private String description;

    private String icon;

    private String color;

    private int order;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private boolean seeded = false;
}
