package com.nabhaleam.config;

import com.nabhaleam.common.ApiError;
import com.nabhaleam.security.CsrfHeaderFilter;
import com.nabhaleam.security.JwtAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.AuthorizationFilter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CsrfHeaderFilter csrfHeaderFilter;
    private final AppProperties properties;
    private final ObjectMapper objectMapper;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/", "/index.html", "/courses", "/about", "/contact", "/login",
                                "/register", "/privacy", "/terms", "/app", "/app/**",
                                "/css/**", "/js/**", "/assets/**", "/favicon.ico", "/robots.txt").permitAll()
                        .requestMatchers("/api/health", "/api/auth/register", "/api/auth/login").permitAll()
                        // A guest session probe must succeed with empty data so the
                        // SPA can ask "who is signed in?" without a 401 in the console.
                        .requestMatchers(HttpMethod.GET, "/api/auth/me").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/contact").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/classes/**", "/api/schools/**",
                                "/api/subjects/**", "/api/chapters/**", "/api/explore/**").permitAll()
                        .requestMatchers("/api/auth/**").authenticated()
                        .requestMatchers("/api/student/**").hasRole("STUDENT")
                        .requestMatchers("/api/teacher/**").hasAnyRole("TEACHER", "ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/files/**").authenticated()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .exceptionHandling(handling -> handling
                        .authenticationEntryPoint((request, response, ex) -> {
                            response.setStatus(HttpStatus.UNAUTHORIZED.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            objectMapper.writeValue(response.getWriter(),
                                    ApiError.of("Your session has expired. Please sign in again."));
                        })
                        .accessDeniedHandler((request, response, ex) -> {
                            response.setStatus(HttpStatus.FORBIDDEN.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            objectMapper.writeValue(response.getWriter(),
                                    ApiError.of("You do not have permission to perform this action."));
                        }))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(csrfHeaderFilter, AuthorizationFilter.class);

        return http.build();
    }

    /**
     * Origins that must always work regardless of how CORS_ORIGINS is set in
     * the hosting dashboard. This prevents a stale or incomplete environment
     * variable from breaking the deployed frontend.
     */
    private static final List<String> REQUIRED_ORIGINS = List.of(
            "https://nabha-digital-learning-q5z8.onrender.com",
            "https://nabha-digital-learning.onrender.com",
            "https://nabha-digital-learning-backend.onrender.com",
            "http://localhost:8080",
            "http://127.0.0.1:8080",
            "http://localhost:5500",
            "http://127.0.0.1:5500",
            "http://localhost:3000",
            "http://127.0.0.1:3000"
    );

    /** Wildcard patterns for Render previews and local development ports. */
    private static final List<String> REQUIRED_ORIGIN_PATTERNS = List.of(
            "https://nabha-digital-learning-*.onrender.com",
            "http://localhost:*",
            "http://127.0.0.1:*"
    );

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        Set<String> originPatterns = new LinkedHashSet<>();

        for (String origin : properties.getCors().getAllowedOrigins()) {
            if (origin == null || origin.isBlank()) continue;
            String normalized = origin.trim();
            if (!normalized.equals("*") && normalized.endsWith("/")) {
                normalized = normalized.substring(0, normalized.length() - 1);
            }
            originPatterns.add(normalized);
        }
        originPatterns.addAll(REQUIRED_ORIGINS);
        originPatterns.addAll(REQUIRED_ORIGIN_PATTERNS);

        CorsConfiguration config = new CorsConfiguration();
        // Patterns (rather than fixed origins) keep credentials working and
        // also handle preview hostnames such as nabha-digital-learning-abc123.
        config.setAllowedOriginPatterns(new ArrayList<>(originPatterns));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // Use "*" so the browser's requested header casing (usually lowercase
        // in Access-Control-Request-Headers) is echoed correctly. Origins are
        // still restricted to the list above, so this is not open CORS.
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Content-Disposition", "X-Request-Id"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Register for every path so preflights and error responses also get
        // the CORS headers, not just /api/**.
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
