package com.teambook.panorama.domain.admin.dto.notice;

import java.time.LocalDateTime;

import com.teambook.panorama.domain.admin.entity.Notice;
import com.teambook.panorama.domain.admin.entity.type.NoticeCategory;
import com.teambook.panorama.domain.admin.entity.type.NoticeStatus;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 공지 응답
 */
@Schema(description = "공지 응답")
public record NoticeResponse(

    @Schema(description = "공지 ID", example = "1")
    Long noticeId,

    @Schema(description = "작성자(관리자) ID", example = "3")
    Long userId,

    @Schema(description = "공지 분류", example = "GENERAL")
    NoticeCategory category,

    @Schema(description = "제목", example = "서비스 점검 안내")
    String title,

    @Schema(description = "내용", example = "7월 15일 02:00~04:00 서비스 점검이 진행됩니다.")
    String content,

    @Schema(description = "상단 고정 여부", example = "false")
    boolean pinned,

    @Schema(description = "중요 공지 여부", example = "false")
    boolean important,

    @Schema(description = "공지 상태", example = "ACTIVE")
    NoticeStatus status,

    @Schema(description = "작성 일시", example = "2026-07-10T14:30:00")
    LocalDateTime createdAt,

    @Schema(description = "최종 수정 일시", example = "2026-07-10T16:00:00")
    LocalDateTime updatedAt) {

  public static NoticeResponse from(Notice notice) {
    return new NoticeResponse(
        notice.getNoticeId(),
        notice.getUserId(),
        notice.getCategory(),
        notice.getTitle(),
        notice.getContent(),
        notice.isPinned(),
        notice.isImportant(),
        notice.getStatus(),
        notice.getCreatedAt(),
        notice.getUpdatedAt());
  }
}
