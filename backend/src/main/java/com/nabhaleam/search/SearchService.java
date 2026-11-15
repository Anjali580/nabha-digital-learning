package com.nabhaleam.search;

import com.nabhaleam.explore.ExploreCategory;
import com.nabhaleam.explore.ExploreContent;
import com.nabhaleam.quizzes.Quiz;
import com.nabhaleam.subjects.Subject;
import com.nabhaleam.subjects.SubjectRepository;
import com.nabhaleam.topics.Topic;
import com.nabhaleam.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final MongoTemplate mongoTemplate;
    private final SubjectRepository subjectRepository;

    public SearchResponse search(User student, String rawQuery) {
        String query = rawQuery == null ? "" : rawQuery.trim();
        if (query.length() < 2) {
            return new SearchResponse(query, List.of(), List.of(), List.of(), List.of());
        }
        Pattern pattern = Pattern.compile(Pattern.quote(query), Pattern.CASE_INSENSITIVE);

        List<Topic> topics = mongoTemplate.find(new Query(Criteria.where("classId").is(student.getClassId())
                        .and("active").is(true)
                        .orOperator(Criteria.where("title").regex(pattern),
                                Criteria.where("summary").regex(pattern)))
                .limit(6), Topic.class);
        Map<String, Subject> subjects = new HashMap<>();
        subjectRepository.findAllById(topics.stream().map(Topic::getSubjectId).distinct().toList())
                .forEach(subject -> subjects.put(subject.getId(), subject));
        List<SearchResponse.SearchItem> topicItems = topics.stream()
                .map(topic -> {
                    Subject subject = subjects.get(topic.getSubjectId());
                    return new SearchResponse.SearchItem("TOPIC", topic.getId(), topic.getTitle(),
                            topic.getSummary() == null ? "Academic topic" : topic.getSummary(),
                            "/app/learn/topics/" + topic.getId(),
                            subject == null ? "book" : subject.getIcon(),
                            subject == null ? "#0E9F6E" : subject.getColor(),
                            subject == null ? null : subject.getName());
                })
                .toList();

        List<Subject> subjectHits = mongoTemplate.find(new Query(Criteria
                        .where("classId").is(student.getClassId())
                        .and("active").is(true)
                        .orOperator(Criteria.where("name").regex(pattern),
                                Criteria.where("description").regex(pattern)))
                .limit(4), Subject.class);
        List<SearchResponse.SearchItem> subjectItems = subjectHits.stream()
                .map(subject -> new SearchResponse.SearchItem("SUBJECT", subject.getId(), subject.getName(),
                        subject.getDescription(), "/app/learn/subjects/" + subject.getId(),
                        subject.getIcon(), subject.getColor(), "Subject"))
                .toList();

        List<ExploreContent> exploreHits = mongoTemplate.find(new Query(Criteria.where("published").is(true)
                        .orOperator(Criteria.where("title").regex(pattern),
                                Criteria.where("shortDescription").regex(pattern),
                                Criteria.where("tags").regex(pattern)))
                .limit(6), ExploreContent.class);
        List<SearchResponse.SearchItem> exploreItems = exploreHits.stream()
                .map(content -> {
                    ExploreCategory category = ExploreCategory.fromSlug(content.getCategory());
                    return new SearchResponse.SearchItem("EXPLORE", content.getId(), content.getTitle(),
                            content.getShortDescription(), "/app/explore/" + content.getSlug(),
                            category == null ? "sparkles" : category.getIcon(),
                            category == null ? "#8367E8" : category.getColor(),
                            content.getReadingTimeMinutes() + " min read");
                })
                .toList();

        List<Quiz> quizHits = mongoTemplate.find(new Query(Criteria.where("classId").is(student.getClassId())
                        .and("published").is(true)
                        .orOperator(Criteria.where("title").regex(pattern),
                                Criteria.where("description").regex(pattern)))
                .limit(4), Quiz.class);
        List<SearchResponse.SearchItem> quizItems = quizHits.stream()
                .map(quiz -> new SearchResponse.SearchItem("QUIZ", quiz.getId(), quiz.getTitle(),
                        quiz.getDescription(), "/app/quizzes/" + quiz.getId(),
                        "quiz", "#8367E8", quiz.getQuestions().size() + " questions"))
                .toList();

        List<SearchResponse.SearchItem> all = new ArrayList<>();
        return new SearchResponse(query, topicItems, subjectItems, exploreItems, quizItems);
    }
}
