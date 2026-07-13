package com.teambook.panorama.domain.admin.dto.community;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 커뮤니티 콘텐츠 상세 응답. 원본 이동에 필요한 타입별 참조(parentPostId/bookId/category) 포함.
 */
@Schema(description = "커뮤니티 콘텐츠 상세 응답. 원본 이동에 필요한 타입별 참조(parentPostId/bookId/category)를 포함한다.")
public record CommunityContentDetailResponse(

    @Schema(description = "콘텐츠 타입", allowableValues = {"POST", "COMMENT", "REVIEW"}, example = "POST")
    String contentType,

    @Schema(description = "콘텐츠 ID", example = "42")
    Long contentId,

    @Schema(description = "작성자 사용자 ID", example = "7")
    Long authorUserId,

    @Schema(description = "작성자 닉네임", example = "reader01")
    String authorNickname,

    @Schema(description = "제목. POST 만 값이 있고 그 외에는 null", example = "이 책 추천합니다")
    String title,          // POST 만

    @Schema(description = "전체 내용", example = "읽는 내내 몰입감이 대단했습니다.")
    String content,        // 전체 내용

    @Schema(description = "콘텐츠 상태", allowableValues = {"ACTIVE", "HIDDEN", "DELETED"}, example = "ACTIVE")
    String status,

    @Schema(description = "COMMENT 의 원본 게시글 ID (원본 이동용). 그 외 타입은 null", example = "10")
    Long parentPostId,     // COMMENT: 원본(게시글) 이동용 post_id, 그 외 null

    @Schema(description = "REVIEW 의 관련 도서 ID (POST 는 연관 도서). 그 외 타입은 null", example = "55")
    Long bookId,           // REVIEW: 관련 도서 id, 그 외 null (POST 는 연관도서)

    @Schema(description = "POST 의 카테고리. 그 외 타입은 null", example = "자유")
    String category,       // POST: 카테고리, 그 외 null

    @Schema(description = "이 콘텐츠에 대한 신고 수", example = "3")
    Long reportCount,

    @Schema(description = "작성 일시", example = "2026-07-09T09:15:00")
    LocalDateTime createdAt,

    @Schema(description = "최종 수정 일시", example = "2026-07-10T11:00:00")
    LocalDateTime updatedAt
) {
}
