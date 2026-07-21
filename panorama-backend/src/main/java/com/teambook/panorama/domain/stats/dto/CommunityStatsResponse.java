package com.teambook.panorama.domain.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 홈 화면 "커뮤니티 현황" 공개 통계. 관리자 대시보드 통계(DashboardStatsResponse)에서
 * 비로그인에게도 공개해도 되는 두 항목만 뽑아낸 가벼운 응답이다.
 */
@Schema(description = "홈 커뮤니티 현황(공개) 통계")
public record CommunityStatsResponse(

    @Schema(description = "오늘 방문자 수(오늘 로그인 성공한 고유 회원)", example = "3291")
    Long todayVisitors,

    @Schema(description = "전체 게시글 수(삭제 제외 = ACTIVE·HIDDEN)", example = "14320")
    Long totalPosts
) {
}
