package com.teambook.panorama.domain.admin.dto.report;

import com.teambook.panorama.domain.admin.entity.type.ReportStatus;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 신고 처리 시 필요한 최소 정보 — 대상 식별자 + 현재 상태(재처리 방지용).
 */
@Schema(description = "신고 처리 시 필요한 최소 정보 (대상 식별자 + 현재 상태). 내부 조회용이라 API 응답에는 노출되지 않는다.")
public record ReportTargetKey(

    @Schema(description = "신고 대상 유형", allowableValues = {"POST", "COMMENT", "REVIEW", "USER"}, example = "POST")
    String targetType,

    @Schema(description = "신고 대상 원본 ID", example = "42")
    Long targetId,

    @Schema(description = "현재 처리 상태 (재처리 방지용)", example = "PENDING")
    ReportStatus status
) {
}
