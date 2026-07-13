package com.teambook.panorama.domain.auth.dto;

import com.teambook.panorama.domain.user.enums.Provider;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public class LoginDto {

    @Schema(name = "LoginRequest", description = "로그인 요청")
    public record Request(
            @Schema(description = "로그인 아이디", example = "testuser1")
            @NotBlank String loginId,

            @Schema(description = "비밀번호", example = "Test1234!")
            @NotBlank String password) {
    }

    @Schema(name = "LoginResponse", description = "로그인 응답 (refresh 토큰은 별도 HttpOnly 쿠키로 발급)")
    public record Response(
            @Schema(description = "액세스 토큰 (Authorization: Bearer 헤더에 사용)")
            String accessToken,

            @Schema(description = "로그인 수단 (프론트가 '최근 로그인 수단'으로 저장)", example = "LOCAL")
            Provider provider // 프론트 localStorage("최근 로그인 수단") 저장용
    ) {
        public static Response of(String accessToken, Provider provider) {
            return new Response(accessToken, provider);
        }
    }

    // 재발급 응답 (클라이언트로 나감): access만
    @Schema(name = "AccessTokenResponse", description = "토큰 재발급 응답 (새 access 토큰만)")
    public record AccessResponse(
            @Schema(description = "재발급된 액세스 토큰")
            String accessToken
    ) {
        public static AccessResponse of(String accessToken) {
            return new AccessResponse(accessToken);
        }
    }

    // 서비스 → 컨트롤러 내부 전달용 (클라이언트로 나가지 않음)
    public record IssueResult(
            String accessToken,
            String rawRefreshToken,
            Provider provider) {
    }

}
