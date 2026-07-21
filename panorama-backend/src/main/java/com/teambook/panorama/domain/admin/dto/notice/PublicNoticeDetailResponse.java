package com.teambook.panorama.domain.admin.dto.notice;

import java.time.LocalDateTime;

import com.teambook.panorama.domain.admin.entity.type.NoticeCategory;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 공지 상세 응답(공개용). {@link NoticeDetailResponse}에서 userId 를 뺐다.
 * nickname 은 남긴다 — "누가 썼는지"는 공지의 신뢰도를 보여주는 정보라 공개해도 된다.
 */
@Schema(description = "공지 상세 응답(공개용)")
public record PublicNoticeDetailResponse(

    @Schema(description = "공지 ID", example = "3")
    Long noticeId,

    @Schema(description = "공지 분류", example = "GENERAL")
    NoticeCategory category,

    @Schema(description = "제목", example = "서비스 점검 안내")
    String title,

    @Schema(description = "내용(HTML)", example = "7월 15일 02:00~04:00 서비스 점검이 진행됩니다.")
    String content,

    @Schema(description = "상단 고정 여부", example = "false")
    boolean pinned,

    @Schema(description = "중요 공지 여부", example = "false")
    boolean important,

    @Schema(description = "조회수 (이 응답을 만든 시점에 1 증가한 값)", example = "128")
    Long viewCount,

    @Schema(description = "작성 관리자 닉네임", example = "운영자01")
    String nickname,

    @Schema(description = "작성 일시", example = "2026-07-09T09:15:00")
    LocalDateTime createdAt
) {
}
