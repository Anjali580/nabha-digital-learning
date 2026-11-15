package com.nabhaleam.security;

import com.nabhaleam.common.ApiError;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * The JWT lives in an HttpOnly, SameSite=Strict cookie. As an additional CSRF
 * defence (and a guard against accidental cross-site form posts), every
 * state-changing API request must also carry this custom header. Browsers cannot
 * attach a custom header on a cross-site request without a CORS preflight, and
 * CORS only trusts the configured origins.
 */
@Component
@RequiredArgsConstructor
public class CsrfHeaderFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-NabhaLearn-Client";
    public static final String HEADER_VALUE = "web";

    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String method = request.getMethod();
        boolean mutating = !("GET".equals(method) || "HEAD".equals(method) || "OPTIONS".equals(method));
        boolean apiRequest = request.getRequestURI().startsWith("/api/");

        if (mutating && apiRequest && !HEADER_VALUE.equals(request.getHeader(HEADER))) {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(response.getWriter(),
                    ApiError.of("Request blocked: missing client verification header."));
            return;
        }
        chain.doFilter(request, response);
    }
}
