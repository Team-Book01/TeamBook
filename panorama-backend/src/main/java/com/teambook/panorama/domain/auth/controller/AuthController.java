package com.teambook.panorama.domain.auth.controller;

import java.time.Duration;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.auth.dto.LoginDto;
import com.teambook.panorama.domain.auth.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  private static final String REFRESH_COOKIE = "refreshToken";
  private static final Duration REFRESH_MAX_AGE = Duration.ofDays(14); // JwtProperties와 맞추기

  @PostMapping("/login")
  public ResponseEntity<LoginDto.Response> login(@RequestBody @Valid LoginDto.Request request) {
    LoginDto.IssueResult tokens = authService.login(request);

    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(tokens.rawRefreshToken()).toString())
        .body(LoginDto.Response.of(tokens.accessToken(), tokens.provider()));
  }

  @PostMapping("/reissue")
  public ResponseEntity<LoginDto.AccessResponse> reissue(
      @CookieValue(name = REFRESH_COOKIE) String refreshToken) {
    // 방식 A: refresh는 쿠키에서 읽음. Rotation 미적용 → 새 access만 반환(쿠키 미변경)
    String accessToken = authService.reissue(refreshToken);

    return ResponseEntity.ok(LoginDto.AccessResponse.of(accessToken));
  }

  @PostMapping("/logout")
  public ResponseEntity<Void> logout(@AuthenticationPrincipal Long userId) {
    authService.logout(userId);

    // 서버가 refresh 쿠키를 만료시켜 제거
    return ResponseEntity.noContent()
        .header(HttpHeaders.SET_COOKIE, expireRefreshCookie().toString())
        .build();
  }

  // ---- 쿠키 헬퍼 ----

  private ResponseCookie buildRefreshCookie(String rawRefresh) {
    return ResponseCookie.from(REFRESH_COOKIE, rawRefresh)
        .httpOnly(true) // JS 접근 차단 (XSS 방어)
        .secure(true) // HTTPS 전용 (로컬 개발 시 상황에 따라 false)
        .sameSite("None") // 크로스 오리진이면 None + Secure
        .path("/")
        .maxAge(REFRESH_MAX_AGE)
        .build();
  }

  private ResponseCookie expireRefreshCookie() {
    return ResponseCookie.from(REFRESH_COOKIE, "")
        .httpOnly(true)
        .secure(true)
        .sameSite("None")
        .path("/")
        .maxAge(0) // 즉시 만료 → 브라우저에서 제거
        .build();
  }
}