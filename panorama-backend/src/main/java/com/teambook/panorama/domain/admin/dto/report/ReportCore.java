package com.teambook.panorama.domain.admin.dto.report;

import java.time.LocalDateTime;

import com.teambook.panorama.domain.admin.entity.type.ReportStatus;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 신고 자체의 정보(상세 화면의 신고 헤더). 원본 콘텐츠·누적 신고는 별도로 조회해 조립한다.
 *
 * <p>조인 필드(reporterNickname 마스킹, handlerNickname)가 있어 MyBatis resultMap 으로만 생성한다.</p>
 */
@Schema(description = "신고 자체의 정보 (상세 화면의 신고 헤더)")
public record ReportCore(

    @Schema(description = "신고 ID", example = "1")
    Long reportId,

    @Schema(description = "신고자 사용자 ID", example = "7")
    Long reporterUserId,

    @Schema(description = "신고자 닉네임 (마스킹됨)", example = "pa****")
    String reporterNickname,   // 신고자 — 마스킹됨(pa****)

    @Schema(description = "신고 대상 유형", allowableValues = {"POST", "COMMENT", "REVIEW", "USER"}, example = "POST")
    String targetType,

    @Schema(description = "신고 대상 원본 ID", example = "42")
    Long targetId,

    @Schema(description = "신고 사유 유형", allowableValues = {"ABUSE", "SPAM", "MISINFO", "OBSCENE", "ETC"}, example = "ABUSE")
    String reasonType,

    @Schema(description = "신고자가 작성한 상세 내용", example = "댓글에 욕설이 포함되어 있습니다.")
    String content,

    @Schema(description = "처리 상태", example = "PENDING")
    ReportStatus status,

    @Schema(description = "처리 담당 관리자 ID. 미처리면 null", example = "3")
    Long handlerUserId,

    @Schema(description = "처리 담당 관리자 닉네임 (마스킹하지 않음). 미처리면 null", example = "admin01")
    String handlerNickname,    // 처리 담당(관리자) — 마스킹 안 함

    @Schema(description = "처리 일시. 미처리면 null", example = "2026-07-10T16:00:00")
    LocalDateTime processedAt,

    // 신고자가 고른 reasonType 과 혼동하지 말 것. 이쪽은 관리자가 처리하며 남긴 사유다.
    @Schema(description = "관리자가 남긴 처리 사유. 미처리거나 사유 없이 처리했으면 null",
        example = "욕설이 반복 확인되어 삭제 처리했습니다.")
    String processReason,

    @Schema(description = "신고 일시", example = "2026-07-10T14:30:00")
    LocalDateTime createdAt,

    @Schema(description = "최종 수정 일시", example = "2026-07-10T16:00:00")
    LocalDateTime updatedAt
) {
}
