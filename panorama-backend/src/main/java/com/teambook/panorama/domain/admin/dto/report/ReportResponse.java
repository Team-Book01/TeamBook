package com.teambook.panorama.domain.admin.dto.report;

import java.time.LocalDateTime;

import com.teambook.panorama.domain.admin.entity.type.ReportStatus;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 신고 목록(요약) 응답. 1건 = 1행, 최신순.
 *
 * <p>조인 필드(reporterNickname)가 있으므로 from() 을 두지 않고 MyBatis resultMap 으로만 생성한다.
 * (CONVENTIONS.md §3 함정) — 신고자 닉네임은 매퍼에서 마스킹된 값이 들어온다.</p>
 */
@Schema(description = "신고 목록(요약) 응답. 1건 = 1행, 최신순.")
public record ReportResponse(

    @Schema(description = "신고 ID", example = "1")
    Long reportId,

    @Schema(description = "신고 대상 유형", allowableValues = {"POST", "COMMENT", "REVIEW", "USER"}, example = "POST")
    String targetType,          // POST / COMMENT / REVIEW / USER (String)

    @Schema(description = "신고 대상 원본 ID", example = "42")
    Long targetId,              // 신고 대상 원본 ID

    @Schema(description = "원본 요약(조인). POST=제목, COMMENT/REVIEW=내용 앞부분, USER=닉네임. 원본이 없으면 null",
        example = "이 책 정말 최고네요")
    String targetSummary,       // 원본 요약(조인): POST=제목, COMMENT/REVIEW=내용 앞부분, USER=닉네임. 원본 없으면 null

    @Schema(description = "신고 사유 유형", allowableValues = {"ABUSE", "SPAM", "MISINFO", "OBSCENE", "ETC"}, example = "ABUSE")
    String reasonType,          // 신고 사유 유형 (String)

    @Schema(description = "처리 상태", example = "PENDING")
    ReportStatus status,        // PENDING / RESOLVED / REJECTED

    @Schema(description = "신고자 닉네임 (마스킹됨)", example = "pa****")
    String reporterNickname,    // 신고자 닉네임 — 마스킹됨(예: pa****)

    @Schema(description = "신고 일시", example = "2026-07-10T14:30:00")
    LocalDateTime createdAt     // 신고 일시
) {
}
