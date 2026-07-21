package com.teambook.panorama.domain.stats.repository;

import org.apache.ibatis.annotations.Mapper;

import com.teambook.panorama.domain.stats.dto.CommunityStatsResponse;

/**
 * 홈 커뮤니티 현황(공개) 통계 전용 MyBatis 매퍼. (조회 전용)
 *
 * <p>관리자 대시보드(DashboardMapper.selectDashboardStats)는 회원·신고·문의 등
 * 관리자 전용 수치까지 한 번에 집계한다. 홈 공개 화면에서는 그중 방문자·게시글 수만
 * 필요하므로, 불필요한 서브쿼리를 타지 않도록 가벼운 전용 쿼리를 둔다.</p>
 */
@Mapper
public interface StatsMapper {

  /** 오늘 방문자 수 + 전체 게시글 수(삭제 제외) — 단일 행 서브쿼리 집계 */
  CommunityStatsResponse selectCommunityStats();
}
