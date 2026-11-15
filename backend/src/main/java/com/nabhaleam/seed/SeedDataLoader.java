package com.nabhaleam.seed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nabhaleam.assignments.Assignment;
import com.nabhaleam.assignments.AssignmentRepository;
import com.nabhaleam.chapters.Chapter;
import com.nabhaleam.chapters.ChapterRepository;
import com.nabhaleam.classes.SchoolClass;
import com.nabhaleam.classes.SchoolClassRepository;
import com.nabhaleam.config.AppProperties;
import com.nabhaleam.explore.ExploreContent;
import com.nabhaleam.explore.ExploreContentRepository;
import com.nabhaleam.learningcontent.LearningContent;
import com.nabhaleam.learningcontent.LearningContentRepository;
import com.nabhaleam.notifications.NotificationService;
import com.nabhaleam.notifications.NotificationType;
import com.nabhaleam.quizzes.Quiz;
import com.nabhaleam.quizzes.QuizRepository;
import com.nabhaleam.schools.School;
import com.nabhaleam.schools.SchoolRepository;
import com.nabhaleam.subjects.Subject;
import com.nabhaleam.subjects.SubjectRepository;
import com.nabhaleam.topics.Topic;
import com.nabhaleam.topics.TopicRepository;
import com.nabhaleam.users.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SeedDataLoader implements ApplicationRunner {

    private final AppProperties properties;
    private final ObjectMapper objectMapper;
    private final MongoTemplate mongoTemplate;
    private final SchoolRepository schoolRepository;
    private final SchoolClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final TopicRepository topicRepository;
    private final LearningContentRepository contentRepository;
    private final ExploreContentRepository exploreRepository;
    private final QuizRepository quizRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final StudentPreferencesRepository preferencesRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    @Override
    public void run(ApplicationArguments args) {
        if (!properties.getSeed().isEnabled()) {
            log.info("Seed data is disabled (SEED_ENABLED=false)");
            return;
        }
        try {
            SeedFile seed = readSeed();
            boolean apply = shouldApply(seed.getVersion());
            if (apply) {
                applyContent(seed);
                mongoTemplate.save(new SeedMeta("seed", seed.getVersion(), Instant.now()));
                log.info("Applied NabhaLearn seed version {}", seed.getVersion());
            } else {
                log.info("Seed version {} already applied", seed.getVersion());
            }
            User demo = ensureDemoStudent();
            seedDemoNotifications(demo, seed);
        } catch (Exception ex) {
            log.error("Could not load seed data", ex);
        }
    }

    private SeedFile readSeed() throws Exception {
        try (InputStream input = new ClassPathResource("seed/seed.json").getInputStream()) {
            return objectMapper.readValue(input, SeedFile.class);
        }
    }

    private boolean shouldApply(String version) {
        SeedMeta meta = mongoTemplate.findById("seed", SeedMeta.class);
        return meta == null || version == null || !version.equals(meta.getVersion());
    }

    private void applyContent(SeedFile seed) {
        seed.getSchools().forEach(this::upsertSchool);
        seed.getClasses().forEach(this::upsertClass);
        seed.getSubjects().forEach(this::upsertSubject);
        seed.getChapters().forEach(this::upsertChapter);
        seed.getTopics().forEach(this::upsertTopic);
        seed.getLearningContents().forEach(this::upsertContent);
        seed.getExploreContents().forEach(this::upsertExplore);
        seed.getQuizzes().forEach(this::upsertQuiz);

        Instant now = Instant.now();
        for (Assignment assignment : seed.getAssignments()) {
            if (assignment.getAssignedDate() == null) {
                assignment.setAssignedDate(now.minus(Duration.ofDays(3)));
            }
            if (assignment.getDueDate() == null) {
                assignment.setDueDate(now.plus(Duration.ofDays(7)));
            }
            assignmentRepository.save(assignment);
        }
    }

    private void upsertSchool(School school) {
        if (!schoolRepository.existsById(school.getId())) {
            schoolRepository.save(school);
        } else if (school.isDemo()) {
            schoolRepository.save(school);
        }
    }

    private void upsertClass(SchoolClass schoolClass) {
        if (!classRepository.existsById(schoolClass.getId())) {
            classRepository.save(schoolClass);
        } else {
            classRepository.save(schoolClass);
        }
    }

    private void upsertSubject(Subject subject) {
        subjectRepository.save(subject);
    }

    private void upsertChapter(Chapter chapter) {
        chapterRepository.save(chapter);
    }

    private void upsertTopic(Topic topic) {
        topicRepository.save(topic);
    }

    private void upsertContent(LearningContent content) {
        contentRepository.save(content);
    }

    private void upsertExplore(ExploreContent content) {
        exploreRepository.save(content);
    }

    private void upsertQuiz(Quiz quiz) {
        if (quiz.getTotalMarks() <= 0) {
            quiz.setTotalMarks(quiz.getQuestions().stream()
                    .mapToInt(com.nabhaleam.quizzes.QuizQuestion::getMarks).sum());
        }
        quizRepository.save(quiz);
    }

    private User ensureDemoStudent() {
        AppProperties.Demo demo = properties.getDemo();
        User existing = userRepository.findByEmailIgnoreCase(demo.getEmail()).orElse(null);
        if (existing != null) {
            return existing;
        }
        SchoolClass schoolClass = classRepository.findById("class-8").orElse(null);
        if (schoolClass == null) {
            log.warn("Demo class-8 is missing; demo student was not created");
            return null;
        }
        User user = userRepository.save(User.builder()
                .email(demo.getEmail().toLowerCase())
                .fullName("Demo Student")
                .passwordHash(passwordEncoder.encode(demo.getPassword()))
                .role(Role.STUDENT)
                .active(true)
                .schoolName("NabhaLearn Demo School")
                .classId(schoolClass.getId())
                .className(schoolClass.getName())
                .preferredLanguage("en")
                .demo(true)
                .build());
        preferencesRepository.save(StudentPreferences.builder()
                .studentId(user.getId())
                .language("en")
                .theme("light")
                .emailNotifications(true)
                .assignmentReminders(true)
                .dailyGoalTopics(2)
                .build());
        notificationService.notify(user.getId(), NotificationType.WELCOME,
                "Welcome to NabhaLearn, Demo!",
                "This demo account starts with real, empty progress. Learn a topic, take a quiz and watch your dashboard update.",
                "/app/dashboard", "welcome:" + user.getId());
        log.info("Created demo student account {}", demo.getEmail());
        return user;
    }

    private void seedDemoNotifications(User demo, SeedFile seed) {
        if (demo == null) {
            return;
        }
        List<Assignment> assignments = seed.getAssignments().stream()
                .filter(a -> demo.getClassId().equals(a.getClassId()))
                .limit(2)
                .toList();
        for (Assignment assignment : assignments) {
            String dueText = assignment.getDueDate() == null
                    ? "No due date set."
                    : "Due in " + Math.max(0, Duration.between(Instant.now(), assignment.getDueDate()).toDays()) + " days. ";
            notificationService.notify(demo.getId(), NotificationType.ASSIGNMENT_NEW,
                    "New assignment: " + assignment.getTitle(),
                    dueText + "Open the assignment to read the instructions.",
                    "/app/assignments/" + assignment.getId(),
                    "assignment-new:" + assignment.getId());
        }
        seed.getExploreContents().stream().findFirst().ifPresent(content ->
                notificationService.notify(demo.getId(), NotificationType.LEARNING_UPDATE,
                        "Explore something new",
                        "\"" + content.getTitle() + "\" is waiting in Beyond the Book.",
                        "/app/explore/" + content.getSlug(),
                        "explore-new:" + content.getId()));
    }
}
