package com.teambook.panorama.domain.admin.dto.dashboard;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 대시보드 상단 통계 카드. 단일 행(서브쿼리 집계)으로 조회한다.
 */
@Schema(description = "대시보드 상단 통계 카드")
public record DashboardStatsResponse(

    @Schema(description = "전체 회원 수(탈퇴 제외)", example = "12480")
    Long totalUsers,

    @Schema(description = "이번 주 신규 가입 수(월요일 0시 이후)", example = "128")
    Long newUsersThisWeek,

    @Schema(description = "오늘 방문자 수(오늘 로그인 성공한 고유 회원)", example = "3291")
    Long todayVisitors,

    @Schema(description = "전체 게시글 수(ACTIVE)", example = "14320")
    Long totalPosts,

    @Schema(description = "오늘 신규 게시글 수", example = "47")
    Long newPostsToday,

    @Schema(description = "처리 대기 신고 수(PENDING)", example = "7")
    Long pendingReports,

    @Schema(description = "답변 대기 문의 수(PENDING)", example = "4")
    Long pendingInquiries
) {
}
