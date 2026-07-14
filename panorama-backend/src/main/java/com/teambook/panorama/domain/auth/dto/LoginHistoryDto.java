package com.teambook.panorama.domain.auth.dto;

import java.time.LocalDateTime;

import com.teambook.panorama.domain.auth.entity.LoginHistory;
import com.teambook.panorama.domain.auth.enums.LoginResult;
import com.teambook.panorama.domain.user.enums.Provider;

import io.swagger.v3.oas.annotations.media.Schema;

public class LoginHistoryDto {

    @Schema(name = "LoginHistoryResponse", description = "로그인 이력 항목")
    public record Response(
            @Schema(description = "로그인 수단", example = "LOCAL")
            Provider provider,

            @Schema(description = "로그인 결과 (SUCCESS: 성공, FAIL: 실패)", example = "SUCCESS")
            LoginResult result,

            @Schema(description = "로그인 시도 시각", example = "2026-07-14T09:30:00")
            LocalDateTime attemptedAt) {
        public static Response from(LoginHistory h) {
            return new Response(h.getProvider(), h.getResult(), h.getAttemptedAt());
        }
    }
}