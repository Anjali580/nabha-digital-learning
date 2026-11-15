package com.nabhaleam.contact;

import com.nabhaleam.common.ApiException;
import com.nabhaleam.common.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;

/**
 * Public contact form. Messages are stored so the project team can review them;
 * no email is sent automatically in this demo deployment.
 */
@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactMessageRepository repository;

    @PostMapping
    public ApiResponse<Void> send(@Valid @RequestBody ContactRequest request) {
        if (request.website() != null && !request.website().isBlank()) {
            // Honeypot field: silently accept so bots do not learn the check.
            return ApiResponse.message("Thank you for your message.");
        }
        String email = request.email().trim().toLowerCase();
        long recent = repository.countByEmailIgnoreCaseAndCreatedAtAfter(email,
                Instant.now().minus(Duration.ofHours(1)));
        if (recent >= 5) {
            throw ApiException.tooManyRequests(
                    "You have sent several messages recently. Please try again in an hour.");
        }
        repository.save(ContactMessage.builder()
                .name(request.name().trim())
                .email(email)
                .topic(request.topic() == null ? "General" : request.topic())
                .subject(request.subject().trim())
                .message(request.message().trim())
                .createdAt(Instant.now())
                .build());
        return ApiResponse.message("Thank you! Your message has been received.");
    }

    public record ContactRequest(
            @NotBlank(message = "Please enter your name.")
            @Size(min = 2, max = 80, message = "Name must be between 2 and 80 characters.")
            String name,

            @NotBlank(message = "Please enter your email address.")
            @Email(message = "Enter a valid email address.")
            @Size(max = 160, message = "Email is too long.")
            String email,

            @NotBlank(message = "Please add a subject.")
            @Size(min = 3, max = 120, message = "Subject must be between 3 and 120 characters.")
            String subject,

            @NotBlank(message = "Please write a message.")
            @Size(min = 10, max = 2000, message = "Message must be between 10 and 2000 characters.")
            String message,

            @Pattern(regexp = "General|Learning|Account|Feedback|Partnership|Other",
                    message = "Choose a valid topic.")
            String topic,

            /** Optional honeypot; real users leave this empty. */
            String website
    ) {
    }
}
