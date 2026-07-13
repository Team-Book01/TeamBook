package com.teambook.panorama.domain.admin.service;

import com.teambook.panorama.domain.admin.dto.report.BulkResult;
import com.teambook.panorama.domain.admin.dto.report.ReportBulkProcessRequest;
import com.teambook.panorama.domain.admin.dto.report.ReportCreateRequest;
import com.teambook.panorama.domain.admin.dto.report.ReportDetailResponse;
import com.teambook.panorama.domain.admin.dto.report.ReportProcessRequest;
import com.teambook.panorama.domain.admin.dto.report.ReportResponse;
import com.teambook.panorama.domain.admin.dto.report.ReportSearchRequest;
import com.teambook.panorama.global.response.PageResponse;

/**
 * 사용자 신고 등록 서비스. (관리자 조회·처리는 {@link AdminService})
 */
public interface ReportService {

  /** 신고 등록. 생성된 report_id 반환. */
  Long createReport(ReportCreateRequest request);

  // 신고 - 목록(+검색)
  PageResponse<ReportResponse> getReports(ReportSearchRequest request);

  // 신고 - 상세
  ReportDetailResponse getReportDetail(Long reportId);

  // 신고 - 처리(단건)
  void processReport(Long reportId, ReportProcessRequest request);

  // 신고 - 처리(일괄) — 체크박스로 선택한 여러 건을 한 번에 처리
  BulkResult processReports(ReportBulkProcessRequest request);
}
