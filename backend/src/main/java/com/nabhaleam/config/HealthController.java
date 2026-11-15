package com.nabhaleam.config;

import com.nabhaleam.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final MongoTemplate mongoTemplate;

    @GetMapping
    public ApiResponse<Map<String, Object>> health() {
        boolean databaseUp;
        try {
            mongoTemplate.executeCommand("{ ping: 1 }");
            databaseUp = true;
        } catch (Exception ex) {
            databaseUp = false;
        }
        return ApiResponse.ok(Map.of(
                "status", databaseUp ? "UP" : "DEGRADED",
                "database", databaseUp ? "UP" : "DOWN",
                "service", "NabhaLearn API",
                "time", Instant.now().toString()));
    }
}
