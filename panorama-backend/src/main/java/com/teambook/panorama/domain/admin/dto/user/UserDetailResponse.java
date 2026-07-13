package com.teambook.panorama.domain.admin.dto.user;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 사용자 상세 응답. 프로필 + 이 사용자가 대상이 된 신고 수(reportReceivedCount).
 */
@Schema(description = "사용자 상세 응답. 프로필 + 이 사용자가 대상이 된 신고 수.")
public record UserDetailResponse(

    @Schema(description = "사용자 ID", example = "7")
    Long userId,

    @Schema(description = "로그인 ID. 소셜 가입이면 null", example = "reader01")
    String loginId,

    @Schema(description = "닉네임", example = "책읽는곰")
    String nickname,

    @Schema(description = "이메일", example = "reader01@example.com")
    String email,

    @Schema(description = "가입 경로", allowableValues = {"LOCAL", "GOOGLE", "NAVER", "KAKAO"}, example = "LOCAL")
    String provider,

    @Schema(description = "권한", allowableValues = {"USER", "ADMIN"}, example = "USER")
    String role,

    @Schema(description = "계정 상태", allowableValues = {"ACTIVE", "SUSPENDED", "DELETED"}, example = "ACTIVE")
    String status,

    @Schema(description = "이 사용자를 대상으로 접수된 신고 건수 (target_type='USER')", example = "2")
    Long reportReceivedCount,   // target_type='USER' 로 이 사용자를 향한 신고 건수

    @Schema(description = "가입 일시", example = "2026-01-05T10:00:00")
    LocalDateTime createdAt,

    @Schema(description = "최종 수정 일시", example = "2026-07-10T16:00:00")
    LocalDateTime updatedAt
) {
}
