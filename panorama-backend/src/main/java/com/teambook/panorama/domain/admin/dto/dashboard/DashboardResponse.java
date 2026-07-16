package com.teambook.panorama.domain.admin.dto.dashboard;

import java.util.List;

import com.teambook.panorama.domain.admin.dto.report.ReportResponse;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 관리자 대시보드 화면 전체 응답(집계). 화면 1개 = API 1건.
 * 각 섹션은 개별 MyBatis 조회 결과를 서비스에서 조립한다.
 */
@Schema(description = "관리자 대시보드 집계 응답")
public record DashboardResponse(

    @Schema(description = "상단 통계 카드")
    DashboardStatsResponse stats,

    @Schema(description = "처리 대기 - 신고 목록(PENDING, 최신순, 상위 N건). 신고 목록 API 와 동일한 ReportResponse 재사용")
    List<ReportResponse> pendingReports,

    @Schema(description = "처리 대기 - 문의 목록(최신순, 상위 N건)")
    List<PendingInquiryResponse> pendingInquiries,

    @Schema(description = "최근 콘텐츠(게시글, 최신순 상위 N건)")
    List<RecentContentResponse> recentContents
) {
}
