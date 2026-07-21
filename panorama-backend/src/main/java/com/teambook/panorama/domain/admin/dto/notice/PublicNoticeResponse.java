package com.teambook.panorama.domain.admin.dto.notice;

import java.time.LocalDateTime;

import com.teambook.panorama.domain.admin.entity.type.NoticeCategory;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 공지 목록 응답(공개용). 관리자용 {@link NoticeResponse}와 달리 userId 를 담지 않는다 —
 * 작성 관리자의 내부 식별자를 노출할 이유가 없다. status 도 담지 않는다 — 이 목록에는
 * 항상 ACTIVE 만 나온다(서버가 강제).
 */
@Schema(description = "공지 목록 응답(공개용)")
public record PublicNoticeResponse(

    @Schema(description = "공지 ID", example = "3")
    Long noticeId,

    @Schema(description = "공지 분류", example = "GENERAL")
    NoticeCategory category,

    @Schema(description = "제목", example = "서비스 점검 안내")
    String title,

    @Schema(description = "상단 고정 여부", example = "false")
    boolean pinned,

    @Schema(description = "중요 공지 여부", example = "false")
    boolean important,

    @Schema(description = "작성 일시", example = "2026-07-09T09:15:00")
    LocalDateTime createdAt
) {
}
