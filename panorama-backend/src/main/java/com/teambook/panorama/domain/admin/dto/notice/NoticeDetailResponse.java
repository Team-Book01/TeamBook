package com.teambook.panorama.domain.admin.dto.notice;

import java.time.LocalDateTime;

import com.teambook.panorama.domain.admin.entity.type.NoticeCategory;
import com.teambook.panorama.domain.admin.entity.type.NoticeStatus;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 공지사항 상세 응답.
 *
 * <p>nickname은 users 조인으로만 채워진다(Notice 엔티티에 없음). 따라서 from(entity) 를 두지 않고
 * notice.xml의 noticeDetailMap resultMap 으로만 생성한다.</p>
 */
@Schema(description = "공지사항 상세 응답")
public record NoticeDetailResponse(

    @Schema(description = "공지 ID", example = "1")
    Long noticeId,

    @Schema(description = "작성자(관리자) ID", example = "3")
    Long userId,

    @Schema(description = "공지 분류", example = "GENERAL")
    NoticeCategory category,

    @Schema(description = "제목", example = "서비스 점검 안내")
    String title,

    @Schema(description = "전체 내용", example = "7월 15일 02:00~04:00 서비스 점검이 진행됩니다.")
    String content,

    @Schema(description = "상단 고정 여부", example = "false")
    boolean pinned,

    @Schema(description = "중요 공지 여부", example = "false")
    boolean important,

    @Schema(description = "조회수", example = "128")
    Long viewCount,

    @Schema(description = "공지 상태", example = "ACTIVE")
    NoticeStatus status,

    @Schema(description = "공지 작성자 닉네임", example = "admin01")
    String nickname,

    @Schema(description = "작성 일시", example = "2026-07-10T14:30:00")
    LocalDateTime createdAt,

    @Schema(description = "최종 수정 일시", example = "2026-07-10T16:00:00")
    LocalDateTime updatedAt
) {
}
