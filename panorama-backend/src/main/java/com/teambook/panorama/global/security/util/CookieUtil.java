package com.teambook.panorama.global.security.util;

import java.time.Duration;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import com.teambook.panorama.global.security.jwt.JwtProperties;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CookieUtil {

    private final JwtProperties jwtProperties;
    private static final String REFRESH_COOKIE = "refreshToken";

    public ResponseCookie buildRefreshCookie(String rawRefresh) {
        return ResponseCookie.from(REFRESH_COOKIE, rawRefresh)
                .httpOnly(true).secure(true).sameSite("None").path("/")
                .maxAge(Duration.ofMillis(jwtProperties.refreshTokenExpiration()))
                .build();
    }

    public ResponseCookie expireRefreshCookie() {
        return ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true).secure(true).sameSite("None").path("/")
                .maxAge(0)
                .build();
    }
}