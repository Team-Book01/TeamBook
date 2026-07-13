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
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Auth", description = "로그인 · 토큰 재발급 · 로그아웃 API")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  private static final String REFRESH_COOKIE = "refreshToken";
  private static final Duration REFRESH_MAX_AGE = Duration.ofDays(14); // JwtProperties와 맞추기

  @Operation(
      summary = "로그인",
      description = "loginId·password로 로그인한다. 성공 시 응답 바디로 access 토큰을, "
          + "Set-Cookie(refreshToken, HttpOnly)로 refresh 토큰을 발급한다.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "로그인 성공 (access 토큰 반환 + refresh 쿠키 발급)"),
      @ApiResponse(responseCode = "400", description = "입력값 검증 실패 (C001)"),
      @ApiResponse(responseCode = "401", description = "아이디 또는 비밀번호 불일치 (A004)")
  })
  @PostMapping("/login")
  public ResponseEntity<LoginDto.Response> login(@RequestBody @Valid LoginDto.Request request) {
    LoginDto.IssueResult tokens = authService.login(request);

    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(tokens.rawRefreshToken()).toString())
        .body(LoginDto.Response.of(tokens.accessToken(), tokens.provider()));
  }

  @Operation(
      summary = "액세스 토큰 재발급",
      description = "refreshToken 쿠키로 새 access 토큰을 발급한다. Rotation 미적용이라 refresh 쿠키는 변경되지 않는다.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "재발급 성공 (새 access 토큰 반환)"),
      @ApiResponse(responseCode = "401",
          description = "쿠키에 refresh 토큰 없음(A006) · 유효하지 않은 토큰(A001) · 저장된 refresh 토큰 없음(A003)")
  })
  @PostMapping("/reissue")
  public ResponseEntity<LoginDto.AccessResponse> reissue(
      @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken) {
    // 로그아웃해서 쿠기가 없는 경우
    if (refreshToken == null){
      throw new BusinessException(ErrorCode.REFRESH_TOKEN_MISSING);
    }
    // refresh는 쿠키에서 읽음. Rotation 미적용 → 새 access만 반환(쿠키 미변경)
    String accessToken = authService.reissue(refreshToken);

    return ResponseEntity.ok(LoginDto.AccessResponse.of(accessToken));
  }

  @Operation(
      summary = "로그아웃",
      description = "저장된 refresh 토큰을 삭제하고 refresh 쿠키를 즉시 만료시킨다. Authorization 헤더의 access 토큰 필요.",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "로그아웃 성공 (본문 없음)"),
      @ApiResponse(responseCode = "401", description = "인증되지 않은 요청")
  })
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