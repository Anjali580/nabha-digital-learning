package com.nabhaleam.learningcontent;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentSection {
    private String heading;
    private String body;
    private List<String> bullets = new ArrayList<>();

    public ContentSection(String heading, String body) {
        this.heading = heading;
        this.body = body;
        this.bullets = new ArrayList<>();
    }
}
