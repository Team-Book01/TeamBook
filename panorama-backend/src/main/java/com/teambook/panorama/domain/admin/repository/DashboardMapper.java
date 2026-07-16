package com.teambook.panorama.domain.admin.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.teambook.panorama.domain.admin.dto.dashboard.DashboardStatsResponse;
import com.teambook.panorama.domain.admin.dto.dashboard.PendingInquiryResponse;
import com.teambook.panorama.domain.admin.dto.dashboard.RecentContentResponse;

/**
 * 관리자 대시보드 집계 전용 MyBatis 매퍼. (조회 전용)
 */
@Mapper
public interface DashboardMapper {

  // ══════════════ 대시보드 ══════════════

  /** 상단 통계 카드(회원/방문자/게시글/신고·문의 대기 수) — 단일 행 서브쿼리 집계 */
  DashboardStatsResponse selectDashboardStats();

  // 처리 대기 - 신고는 ReportMapper.selectReports(PENDING 필터)를 재사용한다. (DashboardServiceImpl 참고)

  /** 처리 대기 - 문의 목록(PENDING, 최신순) */
  List<PendingInquiryResponse> selectPendingInquiries(@Param("limit") int limit);

  /** 최근 콘텐츠(게시글, 최신순) */
  List<RecentContentResponse> selectRecentContents(@Param("limit") int limit);
}
