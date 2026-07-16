package com.teambook.panorama.domain.admin.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.admin.dto.dashboard.DashboardResponse;
import com.teambook.panorama.domain.admin.dto.report.ReportResponse;
import com.teambook.panorama.domain.admin.dto.report.ReportSearchRequest;
import com.teambook.panorama.domain.admin.entity.type.ReportStatus;
import com.teambook.panorama.domain.admin.repository.DashboardMapper;
import com.teambook.panorama.domain.admin.repository.ReportMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

  /** 대시보드 각 목록 섹션의 노출 건수(화면 미리보기 + "전체 목록 보기"). */
  private static final int PREVIEW_LIMIT = 5;

  private final DashboardMapper dashboardMapper; // 대시보드 전용 집계(MyBatis)
  private final ReportMapper reportMapper;       // 신고 대기 목록은 기존 신고 목록 쿼리 재사용

  @Override
  public DashboardResponse getDashboard() {
    return new DashboardResponse(
        dashboardMapper.selectDashboardStats(),
        selectPendingReports(),
        dashboardMapper.selectPendingInquiries(PREVIEW_LIMIT),
        dashboardMapper.selectRecentContents(PREVIEW_LIMIT));
  }

  /**
   * 처리 대기 신고 상위 N건. 신고 목록 API 와 같은 {@link ReportMapper#selectReports} 를 재사용한다
   * (status=PENDING, 1페이지, size=PREVIEW_LIMIT). 마스킹·원본 요약 로직이 한 곳에서 관리된다.
   */
  private List<ReportResponse> selectPendingReports() {
    ReportSearchRequest pendingTop = new ReportSearchRequest(
        null, null, null, ReportStatus.PENDING, null, null, null, null, 1, PREVIEW_LIMIT);
    return reportMapper.selectReports(pendingTop);
  }
}
