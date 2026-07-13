package com.teambook.panorama.domain.admin.dto.dashboard;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 처리 대기 - 문의 1건. 작성자 닉네임은 매퍼에서 마스킹된 값이 온다.
 */
@Schema(description = "처리 대기 문의 항목")
public record PendingInquiryResponse(

    @Schema(description = "문의 ID", example = "1")
    Long inquiryId,

    @Schema(description = "문의 분류", example = "ACCOUNT")
    String category,

    @Schema(description = "제목", example = "로그인이 안돼요")
    String title,

    @Schema(description = "작성자 닉네임(마스킹)", example = "lee****")
    String writerNickname,

    @Schema(description = "문의 일시", example = "2026-07-13T13:00:00")
    LocalDateTime createdAt
) {
}
