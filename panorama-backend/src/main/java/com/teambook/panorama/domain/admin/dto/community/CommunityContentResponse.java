package com.teambook.panorama.domain.admin.dto.community;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 커뮤니티 콘텐츠 목록(요약) 응답. 타입 무관하게 정규화. MyBatis resultMap 으로 생성.
 */
@Schema(description = "커뮤니티 콘텐츠 목록(요약) 응답. 타입 무관하게 정규화된 형태.")
public record CommunityContentResponse(

    @Schema(description = "콘텐츠 타입", allowableValues = {"POST", "COMMENT", "REVIEW"}, example = "POST")
    String contentType,      // POST / COMMENT / REVIEW

    @Schema(description = "콘텐츠 ID", example = "42")
    Long contentId,

    @Schema(description = "작성자 사용자 ID", example = "7")
    Long authorUserId,

    @Schema(description = "작성자 닉네임. 관리 대상이라 마스킹하지 않는다.", example = "reader01")
    String authorNickname,   // 작성자 — 관리 대상이라 마스킹하지 않음

    @Schema(description = "제목. POST 만 값이 있고 그 외에는 null", example = "이 책 추천합니다")
    String title,            // POST 만 값, 그 외 null

    @Schema(description = "내용 앞 100자 요약", example = "읽는 내내 몰입감이 대단했습니다...")
    String contentSummary,   // 내용 앞 100자

    @Schema(description = "콘텐츠 상태", allowableValues = {"ACTIVE", "HIDDEN", "DELETED"}, example = "ACTIVE")
    String status,           // ACTIVE / HIDDEN / DELETED

    @Schema(description = "작성 일시", example = "2026-07-09T09:15:00")
    LocalDateTime createdAt,

    @Schema(description = "이 콘텐츠에 대한 신고 수", example = "3")
    Long reportCount         // 이 콘텐츠에 대한 신고 수
) {
}
