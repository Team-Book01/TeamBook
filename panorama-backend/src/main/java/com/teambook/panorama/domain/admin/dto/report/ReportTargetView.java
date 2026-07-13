package com.teambook.panorama.domain.admin.dto.report;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 신고 대상 원본을 타입 무관하게 정규화한 뷰. (target_type 별로 다른 테이블에서 조인)
 *
 * <p>USER 대상은 content 가 없어 null 이고 authorNickname 이 곧 그 사용자다.</p>
 */
@Schema(description = "신고 대상 원본을 타입 무관하게 정규화한 뷰. USER 대상은 content 가 null 이고 authorNickname 이 곧 그 사용자다.")
public record ReportTargetView(

    @Schema(description = "신고 대상 유형", allowableValues = {"POST", "COMMENT", "REVIEW", "USER"}, example = "POST")
    String targetType,       // POST / COMMENT / REVIEW / USER

    @Schema(description = "신고 대상 원본 ID", example = "42")
    Long targetId,

    @Schema(description = "원본 내용. USER 대상이면 null", example = "이 책 정말 최고네요")
    String content,          // 원본 내용 (USER 는 null)

    @Schema(description = "원본 작성자(=피신고자) 닉네임. 관리자 조치 대상이라 마스킹하지 않는다.", example = "reader01")
    String authorNickname,   // 원본 작성자(=피신고자) 닉네임 — 관리자 조치 대상이라 마스킹하지 않음

    @Schema(description = "원본 작성 일시", example = "2026-07-09T09:15:00")
    LocalDateTime createdAt, // 원본 작성일시

    @Schema(description = "원본 상태. 콘텐츠는 ACTIVE/DELETED/HIDDEN, USER 는 ACTIVE/SUSPENDED/DELETED", example = "ACTIVE")
    String status,           // 원본 상태 (ACTIVE/DELETED/HIDDEN, USER 는 ACTIVE/SUSPENDED/DELETED)

    @Schema(description = "표시용: 원본이 삭제(DELETED) 상태인가", example = "false")
    Boolean deleted          // 표시용: 원본이 삭제(DELETED) 상태인가 (MyBatis 생성자 매핑 위해 wrapper)
) {
}
