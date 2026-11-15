package com.nabhaleam.learningcontent;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MediaRef {
    private String url;
    private String caption;
    private String alt;
    /** IMAGE, VIDEO or YOUTUBE */
    private String kind;
}
