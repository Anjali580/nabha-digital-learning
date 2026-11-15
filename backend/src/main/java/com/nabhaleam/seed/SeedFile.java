package com.nabhaleam.seed;

import com.nabhaleam.assignments.Assignment;
import com.nabhaleam.chapters.Chapter;
import com.nabhaleam.classes.SchoolClass;
import com.nabhaleam.explore.ExploreContent;
import com.nabhaleam.learningcontent.LearningContent;
import com.nabhaleam.quizzes.Quiz;
import com.nabhaleam.schools.School;
import com.nabhaleam.subjects.Subject;
import com.nabhaleam.topics.Topic;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class SeedFile {

    private String version;
    private List<School> schools = new ArrayList<>();
    private List<SchoolClass> classes = new ArrayList<>();
    private List<Subject> subjects = new ArrayList<>();
    private List<Chapter> chapters = new ArrayList<>();
    private List<Topic> topics = new ArrayList<>();
    private List<LearningContent> learningContents = new ArrayList<>();
    private List<ExploreContent> exploreContents = new ArrayList<>();
    private List<Quiz> quizzes = new ArrayList<>();
    private List<Assignment> assignments = new ArrayList<>();
}
