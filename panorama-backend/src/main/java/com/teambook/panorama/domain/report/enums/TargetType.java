package com.teambook.panorama.domain.report.enums;

/**
 * 신고 대상 유형 — 사용자 신고 제출 경로의 수신 검증용.
 *
 * <p>admin 쪽 Report.targetType 은 DB에 문자열(length 50)로 저장되며 admin 구역에는
 * 대응 enum 이 없다(문자열 계약). 값은 ReportCreateRequest 의 Swagger allowableValues 와
 * 동일하게 유지해야 한다 — admin 구역의 selectReportTarget 분기·관리자 필터가 이 문자열을 소비한다.</p>
 */
public enum TargetType {
    POST,         // 게시글
    COMMENT,      // 댓글
    REVIEW,       // 리뷰
    USER          // 사용자
}
