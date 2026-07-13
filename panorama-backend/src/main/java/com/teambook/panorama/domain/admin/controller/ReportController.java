package com.teambook.panorama.domain.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.admin.dto.report.BulkResult;
import com.teambook.panorama.domain.admin.dto.report.ReportBulkProcessRequest;
import com.teambook.panorama.domain.admin.dto.report.ReportDetailResponse;
import com.teambook.panorama.domain.admin.dto.report.ReportProcessRequest;
import com.teambook.panorama.domain.admin.dto.report.ReportResponse;
import com.teambook.panorama.domain.admin.dto.report.ReportSearchRequest;
import com.teambook.panorama.domain.admin.service.ReportService;
import com.teambook.panorama.global.response.PageResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@Tag(name = "관리자 - 신고 관리", description = "신고 목록/상세 조회 및 처리 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/reports")
public class ReportController {

  private final ReportService reportService;

  // 신고 관리
  /** 
   * 신고 - 목록 (+검색)
   * @param request
   * @return
   */
  @Operation(summary = "신고 목록 조회(+검색)",
      description = "검색 조건에 맞는 신고 목록을 페이지 단위로 조회한다. body 를 생략하면 기본 검색(미처리 목록 1페이지)으로 처리한다.")
  @PostMapping
  public ResponseEntity<PageResponse<ReportResponse>> getReports(
      @RequestBody(required = false) ReportSearchRequest request) {
    // body 를 생략하면 기본 검색(미처리 목록 1페이지)으로 처리
    if (request == null) {
      request = ReportSearchRequest.ofDefaults();
    }
    PageResponse<ReportResponse> reports = reportService.getReports(request);
    return ResponseEntity.ok(reports);
  }

  /**
   * 신고 - 상세
   * @param reportId
   * @return
   */
  @Operation(summary = "신고 상세 조회",
      description = "신고 단건의 상세 정보(신고 대상, 신고 사유, 동일 대상에 대한 연관 신고 등)를 조회한다.")
  @GetMapping("/{reportId}")
  public ResponseEntity<ReportDetailResponse> getReportDetail(@PathVariable("reportId") Long reportId) {
    ReportDetailResponse report = reportService.getReportDetail(reportId);
    return ResponseEntity.ok(report);
  }

  /** 
   * 신고 - 처리 (단건)
   * @param reportId
   * @param request
   * @return
   */
  @Operation(summary = "신고 처리 (단건)",
      description = "신고 1건의 상태를 변경하고 담당자를 기록한다. 처리 후 최신 데이터는 프론트가 재조회한다.")
  @PatchMapping("/{reportId}/process")
  public ResponseEntity<Void> processReport(
      @PathVariable("reportId") Long reportId,
      @RequestBody @Valid ReportProcessRequest request) {
    reportService.processReport(reportId, request);
    return ResponseEntity.ok().build(); // 처리 후 최신 데이터는 프론트가 재조회
  }

  /**
   * 신고 - 처리 (일괄). 목록에서 체크박스로 선택한 여러 건을 한 번에 처리한다.
   * @param request 처리할 신고 ID 목록 + 상태 + 담당자
   * @return 처리/건너뜀 건수
   */
  @Operation(summary = "신고 처리 (일괄)",
      description = "목록에서 체크박스로 선택한 여러 건을 한 번에 처리하고, 처리/건너뜀 건수를 반환한다.")
  @PatchMapping("/process")
  public ResponseEntity<BulkResult> processReports(
      @RequestBody @Valid ReportBulkProcessRequest request) {
    BulkResult result = reportService.processReports(request);
    return ResponseEntity.ok(result); // 처리 후 최신 목록은 프론트가 재조회
  }

}
