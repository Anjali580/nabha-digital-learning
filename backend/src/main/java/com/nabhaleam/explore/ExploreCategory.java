package com.nabhaleam.explore;

public enum ExploreCategory {
    SCIENCE_EVERYDAY_LIFE("science-in-everyday-life", "Science in Everyday Life", "Everyday science around your home and village", "flask", "#0E9F6E"),
    TECHNOLOGY("technology", "Technology", "The tools and systems shaping our world", "chip", "#4F7DF3"),
    HOW_THINGS_WORK("how-things-work", "How Things Work", "Simple explanations of machines and devices", "gear", "#F2994A"),
    SPACE_UNIVERSE("space-universe", "Space and Universe", "Planets, stars and the sky above us", "planet", "#8367E8"),
    NATURE_ENVIRONMENT("nature-environment", "Nature and Environment", "Plants, animals, water and our surroundings", "leaf", "#2FA36B"),
    AGRICULTURE_FARMING("agriculture-farming", "Agriculture and Farming", "Farming practices and modern agriculture", "sprout", "#7BAE37"),
    MACHINES_ENGINEERING("machines-engineering", "Machines and Engineering", "How machines make work easier", "wrench", "#64748B"),
    EXPERIMENTS_DISCOVERIES("experiments-discoveries", "Experiments and Discoveries", "Simple experiments and famous discoveries", "beaker", "#E3A008"),
    GENERAL_KNOWLEDGE("general-knowledge", "General Knowledge", "The world, its people and places", "globe", "#3B82C4"),
    PRACTICAL_LIFE_SKILLS("practical-life-skills", "Practical Life Skills", "Useful skills for everyday life", "hand", "#D9538C"),
    CAREER_AWARENESS("career-awareness", "Career Awareness", "Explore paths for your future", "compass", "#7C5CD6"),
    INTERESTING_FACTS("interesting-facts", "Interesting Facts", "Curious facts worth sharing", "sparkles", "#F2B01E");

    private final String slug;
    private final String title;
    private final String description;
    private final String icon;
    private final String color;

    ExploreCategory(String slug, String title, String description, String icon, String color) {
        this.slug = slug;
        this.title = title;
        this.description = description;
        this.icon = icon;
        this.color = color;
    }

    public String getSlug() {
        return slug;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getIcon() {
        return icon;
    }

    public String getColor() {
        return color;
    }

    public static ExploreCategory fromSlug(String slug) {
        for (ExploreCategory category : values()) {
            if (category.slug.equalsIgnoreCase(slug) || category.name().equalsIgnoreCase(slug)) {
                return category;
            }
        }
        return null;
    }
}
