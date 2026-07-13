package com.teambook.panorama.domain.admin.dto.report;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 신고 상세 응답(조립형). 서비스에서 세 조회 결과를 합쳐 만든다.
 * <ul>
 *   <li>{@code report} — 신고 자체 정보</li>
 *   <li>{@code target} — 원본 콘텐츠(다형 조회). 원본을 못 찾으면 null</li>
 *   <li>{@code relatedReports} — 동일 대상 누적 신고</li>
 * </ul>
 */
@Schema(description = "신고 상세 응답. 신고 정보 + 원본 콘텐츠 + 동일 대상 누적 신고를 합쳐 반환한다.")
public record ReportDetailResponse(

    @Schema(description = "신고 자체 정보")
    ReportCore report,

    @Schema(description = "신고 대상 원본 콘텐츠. 원본을 찾지 못하면 null")
    ReportTargetView target,

    @Schema(description = "동일 대상에 대한 누적 신고 목록")
    List<RelatedReport> relatedReports
) {
}
