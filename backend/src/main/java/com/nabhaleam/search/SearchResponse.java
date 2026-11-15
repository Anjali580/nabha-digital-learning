package com.nabhaleam.search;

import java.util.List;

public record SearchResponse(
        String query,
        List<SearchItem> topics,
        List<SearchItem> subjects,
        List<SearchItem> explore,
        List<SearchItem> quizzes
) {
    public record SearchItem(
            String type,
            String id,
            String title,
            String subtitle,
            String link,
            String icon,
            String color,
            String meta
    ) {
    }

    public int total() {
        return topics.size() + subjects.size() + explore.size() + quizzes.size();
    }
}
