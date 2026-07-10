package com.teambook.panorama.domain.auth.dto;

import com.teambook.panorama.domain.user.enums.Provider;

import jakarta.validation.constraints.NotBlank;

public class LoginDto {

    public record Request(
            @NotBlank String loginId,
            @NotBlank String password) {
    }

    public record Response(
            String accessToken,
            Provider provider // 프론트 localStorage("최근 로그인 수단") 저장용
    ) {
        public static Response of(String accessToken, Provider provider) {
            return new Response(accessToken, provider);
        }
    }

    // 재발급 응답 (클라이언트로 나감): access만
    public record AccessResponse(
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
