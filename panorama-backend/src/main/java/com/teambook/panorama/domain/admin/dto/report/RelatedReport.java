package com.teambook.panorama.domain.admin.dto.report;

import java.time.LocalDateTime;

import com.teambook.panorama.domain.admin.entity.type.ReportStatus;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 동일 대상 누적 신고 목록의 한 항목. (상세 화면 "동일 대상 누적 신고")
 */
@Schema(description = "동일 대상 누적 신고 목록의 한 항목")
public record RelatedReport(

    @Schema(description = "신고 ID", example = "2")
    Long reportId,

    @Schema(description = "신고 사유 유형", allowableValues = {"ABUSE", "SPAM", "MISINFO", "OBSCENE", "ETC"}, example = "SPAM")
    String reasonType,

    @Schema(description = "처리 상태", example = "PENDING")
    ReportStatus status,

    @Schema(description = "신고 일시", example = "2026-07-10T15:00:00")
    LocalDateTime createdAt
) {
}
