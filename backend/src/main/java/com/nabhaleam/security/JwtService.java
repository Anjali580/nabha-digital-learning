package com.nabhaleam.security;

import com.nabhaleam.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Slf4j
@Service
public class JwtService {

    private final SecretKey key;
    private final Duration ttl;

    public JwtService(AppProperties properties) {
        this.ttl = properties.getJwt().getTtl();
        String configured = properties.getJwt().getSecret();
        if (configured == null || configured.isBlank()) {
            this.key = Jwts.SIG.HS256.key().build();
            log.warn("JWT_SECRET is not set. A random development key was generated; "
                    + "sessions will be invalidated on restart. Set JWT_SECRET before deploying.");
        } else {
            byte[] secretBytes = configured.getBytes(StandardCharsets.UTF_8);
            if (secretBytes.length < 32) {
                log.warn("JWT_SECRET is shorter than 32 bytes; deriving a 256-bit key from it. "
                        + "Use a longer random secret in production.");
                secretBytes = sha256(secretBytes);
            }
            this.key = Keys.hmacShaKeyFor(secretBytes);
        }
    }

    public String generateToken(String userId, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId)
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .signWith(key)
                .compact();
    }

    public String extractUserId(String token) {
        return parse(token).getSubject();
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    public Duration getTtl() {
        return ttl;
    }

    private Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private byte[] sha256(byte[] input) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(input);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
    }
}
