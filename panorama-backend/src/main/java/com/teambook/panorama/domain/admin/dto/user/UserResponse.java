package com.teambook.panorama.domain.admin.dto.user;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 사용자 목록(요약) 응답. MyBatis resultMap 으로 생성.
 */
@Schema(description = "사용자 목록(요약) 응답")
public record UserResponse(

    @Schema(description = "사용자 ID", example = "7")
    Long userId,

    @Schema(description = "로그인 ID. 소셜 가입이면 null", example = "reader01")
    String loginId,      // 소셜 가입이면 null

    @Schema(description = "닉네임", example = "책읽는곰")
    String nickname,

    @Schema(description = "가입 경로", allowableValues = {"LOCAL", "GOOGLE", "NAVER", "KAKAO"}, example = "LOCAL")
    String provider,     // LOCAL / GOOGLE / NAVER / KAKAO

    @Schema(description = "권한", allowableValues = {"USER", "ADMIN"}, example = "USER")
    String role,         // USER / ADMIN

    @Schema(description = "계정 상태", allowableValues = {"ACTIVE", "SUSPENDED", "DELETED"}, example = "ACTIVE")
    String status,       // ACTIVE / SUSPENDED / DELETED

    @Schema(description = "가입 일시", example = "2026-01-05T10:00:00")
    LocalDateTime createdAt
) {
}
