package com.teambook.panorama.domain.report.dto;

import com.teambook.panorama.domain.admin.entity.type.ReasonType;
import com.teambook.panorama.domain.report.enums.TargetType;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 사용자 신고 등록 요청. 신고자는 body가 아니라 인증 주체(JWT)에서.
 *
 * <p>targetType/reasonType 은 자유 문자열이 아닌 enum 으로 수신 — 허용 외 값은
 * 역직렬화 단계에서 거부되어 400(C002)으로 나간다(임의 문자열의 DB 유입·관리자 필터 오염 차단).
 * ReasonType 은 admin 구역의 기존 enum 을 읽기 전용 재사용(값 중복 정의 회피 — 이 컨트롤러가
 * admin ReportService 를 쓰는 기존 의존 방향과 동일). TargetType 은 admin 에 대응 enum 이
 * 없어 report 구역에 신설. 저장 파이프라인은 문자열이므로 컨트롤러에서 .name()으로 넘긴다.</p>
 */
public record ReportSubmitRequestDto(
    @NotNull TargetType targetType,
    @NotNull Long targetId,
    @NotNull ReasonType reasonType,
    @Size(max = 255) String content
) {
}
