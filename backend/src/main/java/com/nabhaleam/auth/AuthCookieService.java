package com.nabhaleam.auth;

import com.nabhaleam.config.AppProperties;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class AuthCookieService {

    private final AppProperties properties;

    public AuthCookieService(AppProperties properties) {
        this.properties = properties;
    }

    public ResponseCookie create(String token) {
        return base(token, properties.getJwt().getTtl());
    }

    public ResponseCookie clear() {
        return base("", Duration.ZERO);
    }

    private ResponseCookie base(String value, Duration maxAge) {
        return ResponseCookie.from(properties.getAuth().getCookieName(), value)
                .httpOnly(true)
                .secure(properties.getAuth().isSecureCookie())
                .sameSite("Strict")
                .path("/")
                .maxAge(maxAge)
                .build();
    }
}
