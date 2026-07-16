package com.teambook.panorama.domain.admin.dto.dashboard;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 최근 콘텐츠(게시글) 1건. 작성자 닉네임은 매퍼에서 마스킹된 값이 온다.
 */
@Schema(description = "최근 콘텐츠 항목")
public record RecentContentResponse(

    @Schema(description = "게시글 ID", example = "1")
    Long postId,

    @Schema(description = "게시글 분류", allowableValues = {"RECOMMEND", "REVIEW", "FREE"}, example = "RECOMMEND")
    String category,

    @Schema(description = "제목", example = "봄에 읽기 좋은 소설 추천 10선")
    String title,

    @Schema(description = "작성자 닉네임(마스킹)", example = "park****")
    String authorNickname,

    @Schema(description = "작성 일시", example = "2026-07-13T15:57:00")
    LocalDateTime createdAt
) {
}
