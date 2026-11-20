package com.nabhaleam.auth;

import com.nabhaleam.config.AppProperties;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class AuthCookieService {

    private final AppProperties properties;

    public AuthCookieService(AppProperties properties) {
        this.properties = properties;
    }

    public ResponseCookie create(String token, HttpServletRequest request) {
        return base(token, properties.getJwt().getTtl(), request);
    }

    public ResponseCookie clear(HttpServletRequest request) {
        return base("", Duration.ZERO, request);
    }

    private ResponseCookie base(String value, Duration maxAge, HttpServletRequest request) {
        boolean secure = properties.getAuth().isSecureCookie() || isSecureRequest(request);

        // Cross-site XHR (frontend on one onrender.com subdomain, backend on
        // another) only sends the cookie when it is SameSite=None; Secure.
        // Same-site/local development can keep the stricter Lax default.
        String sameSite = secure ? "None" : "Lax";

        return ResponseCookie.from(properties.getAuth().getCookieName(), value)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(maxAge)
                .build();
    }

    private boolean isSecureRequest(HttpServletRequest request) {
        if (request == null) return false;
        if (request.isSecure()) return true;
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        if (forwardedProto == null) return false;
        // Proxies may append additional values: "https,http".
        String first = forwardedProto.split(",")[0].trim();
        return "https".equalsIgnoreCase(first);
    }
}
