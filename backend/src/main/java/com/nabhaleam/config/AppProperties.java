package com.nabhaleam.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Jwt jwt = new Jwt();
    private final Auth auth = new Auth();
    private final Cors cors = new Cors();
    private final Upload upload = new Upload();
    private final Seed seed = new Seed();
    private final Demo demo = new Demo();

    @Getter
    @Setter
    public static class Jwt {
        private String secret = "";
        private Duration ttl = Duration.ofHours(2);
    }

    @Getter
    @Setter
    public static class Auth {
        private String cookieName = "nl_token";
        private boolean secureCookie = false;
    }

    @Getter
    @Setter
    public static class Cors {
        private List<String> allowedOrigins = new ArrayList<>(List.of("http://localhost:8080"));
    }

    @Getter
    @Setter
    public static class Upload {
        private String dir = "uploads";
        private long maxSizeBytes = 5 * 1024 * 1024L;
        private List<String> allowedContentTypes = new ArrayList<>(List.of(
                "application/pdf", "image/jpeg", "image/png", "image/webp"));
    }

    @Getter
    @Setter
    public static class Seed {
        private boolean enabled = true;
    }

    @Getter
    @Setter
    public static class Demo {
        private String email = "student@nabhaleam.local";
        private String password = "Student@12345";
    }
}
