package com.teambook.panorama.global.security.oauth;

import java.util.Arrays;
import java.util.Base64;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.SerializationUtils;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class HttpCookieOAuth2AuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    public static final String AUTH_REQUEST_COOKIE = "oauth2_auth_request";
    private static final int COOKIE_EXPIRE_SECONDS = 180;   // 3분 (핸드셰이크용 짧은 수명)

    @Value("${app.https}")
    private boolean https;

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return getCookie(request, AUTH_REQUEST_COOKIE)
                .map(cookie -> deserialize(cookie.getValue()))
                .orElse(null);
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest,
                                         HttpServletRequest request, HttpServletResponse response) {
        // null이면 저장 취소(=삭제) 신호
        if (authorizationRequest == null) {
            deleteCookie(request, response, AUTH_REQUEST_COOKIE);
            return;
        }
        ResponseCookie cookie = ResponseCookie.from(AUTH_REQUEST_COOKIE, serialize(authorizationRequest))
                .path("/")
                .httpOnly(true)          // JS 접근 차단
                .sameSite("Lax")         // 콜백은 top-level GET 이동이라 Lax로 전송됨
                .secure(https)           // 로컬 HTTP면 false, 운영(HTTPS)은 true
                .maxAge(COOKIE_EXPIRE_SECONDS)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request,
                                                                 HttpServletResponse response) {
        OAuth2AuthorizationRequest authRequest = loadAuthorizationRequest(request);
        if (authRequest != null) {
            deleteCookie(request, response, AUTH_REQUEST_COOKIE);   // 사용 후 즉시 제거
        }
        return authRequest;
    }

    // ---- 헬퍼 ----

    private Optional<Cookie> getCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return Optional.empty();
        return Arrays.stream(cookies).filter(c -> name.equals(c.getName())).findFirst();
    }

    private void deleteCookie(HttpServletRequest request, HttpServletResponse response, String name) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .path("/").httpOnly(true).sameSite("Lax").secure(false).maxAge(0).build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String serialize(OAuth2AuthorizationRequest obj) {
        return Base64.getUrlEncoder().encodeToString(SerializationUtils.serialize(obj));
    }

    private OAuth2AuthorizationRequest deserialize(String value) {
        return (OAuth2AuthorizationRequest) SerializationUtils.deserialize(
                Base64.getUrlDecoder().decode(value));
    }
}