package com.teambook.panorama.domain.admin.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.admin.dto.report.BulkResult;
import com.teambook.panorama.domain.admin.dto.report.RelatedReport;
import com.teambook.panorama.domain.admin.dto.report.ReportBulkProcessRequest;
import com.teambook.panorama.domain.admin.dto.report.ReportCore;
import com.teambook.panorama.domain.admin.dto.report.ReportCreateRequest;
import com.teambook.panorama.domain.admin.dto.report.ReportDetailResponse;
import com.teambook.panorama.domain.admin.dto.report.ReportProcessRequest;
import com.teambook.panorama.domain.admin.dto.report.ReportResponse;
import com.teambook.panorama.domain.admin.dto.report.ReportSearchRequest;
import com.teambook.panorama.domain.admin.dto.report.ReportTargetKey;
import com.teambook.panorama.domain.admin.dto.report.ReportTargetView;
import com.teambook.panorama.domain.admin.entity.Report;
import com.teambook.panorama.domain.admin.entity.type.ContentAction;
import com.teambook.panorama.domain.admin.entity.type.ReportStatus;
import com.teambook.panorama.domain.admin.repository.ReportMapper;
import com.teambook.panorama.domain.admin.repository.ReportRepository;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;
import com.teambook.panorama.global.response.PageResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

  private final ReportRepository reportRepository;   // 신고 등록은 단건 INSERT → JPA
  private final ReportMapper reportMapper;

  @Override
  @Transactional
  public Long createReport(ReportCreateRequest request) {
    // 같은 사용자가 같은 대상을 중복 신고하지 못하게 막는다. (DB UNIQUE 제약과 이중 방어)
    boolean already = reportRepository.existsByReporterUserIdAndTargetTypeAndTargetId(
        request.reporterUserId(), request.targetType(), request.targetId());
    if (already) {
      throw new BusinessException(ErrorCode.DUPLICATE_REPORT);
    }
    Report saved = reportRepository.save(request.toEntity());   // status 기본 PENDING (엔티티 기본값)
    return saved.getReportId();
  }

  @Override
  public PageResponse<ReportResponse> getReports(ReportSearchRequest request) {
    List<ReportResponse> content = reportMapper.selectReports(request);
    long totalElements = reportMapper.countReports(request);
    return PageResponse.of(content, request.page(), request.size(), totalElements);
  }

  @Override
  public ReportDetailResponse getReportDetail(Long reportId) {
    // 신고 헤더 + 원본(다형) + 동일 대상 누적 신고를 각각 조회해 조립한다.
    ReportCore report = reportMapper.selectReportCore(reportId)
        .orElseThrow(() -> new BusinessException(ErrorCode.REPORT_NOT_FOUND));
    ReportTargetView target = reportMapper
        .selectReportTarget(report.targetType(), report.targetId())
        .orElse(null); // 원본을 못 찾으면(하드삭제 등) null — 프론트가 "원본 없음" 처리
    List<RelatedReport> relatedReports = reportMapper
        .selectRelatedReports(reportId, report.targetType(), report.targetId());
    return new ReportDetailResponse(report, target, relatedReports);
  }

  /**
   * 신고 처리. 한 트랜잭션에서 ① 원본 콘텐츠 조치 → ② 같은 대상 미처리 신고 일괄 RESOLVE → ③ 조치 로그.
   * 이미 종결(RESOLVED/REJECTED)된 신고는 재처리하지 않는다.
   */
  @Override
  @Transactional
  public void processReport(Long reportId, ReportProcessRequest request) {
    ReportTargetKey key = reportMapper.selectReportTargetKey(reportId)
        .orElseThrow(() -> new BusinessException(ErrorCode.REPORT_NOT_FOUND));
    if (key.status() == ReportStatus.RESOLVED || key.status() == ReportStatus.REJECTED) {
      throw new BusinessException(ErrorCode.ALREADY_PROCESSED);
    }
    // 이 API 는 "조치를 취했다"를 기록한다. 되돌리기는 콘텐츠 관리 화면의 몫이고, 여기서 받으면
    // USER 대상의 resolveContentStatus 가 ACTIVE 를 SUSPENDED 로 바꿔버려 정반대 결과가 된다.
    if (request.action() == ContentAction.ACTIVE) {
      throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
    }

    LocalDateTime now = LocalDateTime.now();

    // ① 원본 콘텐츠 실제 조치 (타입별 status 변경)
    //
    // 변경 행 수를 반드시 확인한다. 원본이 이미 하드삭제됐거나 target_type 이 알 수 없는 값이면
    // 0행이 바뀌는데(매퍼의 otherwise 는 no-op), 그대로 진행하면 콘텐츠는 그대로인 채
    // 신고만 RESOLVED 로 종결되고 "조치했다"는 로그까지 남아 감사 기록이 사실과 어긋난다.
    //
    // 이 경로가 막히면 원본이 하드삭제된 신고는 여기서 종결할 수 없다. 그건 의도한 것이다 —
    // 이 API 는 "콘텐츠에 조치를 취했다"를 기록하므로, 조치할 콘텐츠가 없으면 남길 기록도 없다.
    // 그런 신고는 조치 로그 없이 상태만 바꾸는 일괄 처리(processReports / PATCH .../reports)로 정리한다.
    String contentStatus = resolveContentStatus(key.targetType(), request.action());
    int affected = reportMapper.updateTargetStatus(key.targetType(), key.targetId(), contentStatus);
    if (affected == 0) {
      throw new BusinessException(ErrorCode.CONTENT_NOT_FOUND);
    }

    // ② 같은 대상의 미처리 신고를 모두 RESOLVED (유령 신고 방지) — 현재 신고도 여기서 종결됨
    reportMapper.resolveReportsByTarget(key.targetType(), key.targetId(),
        request.handlerUserId(), now, request.reason());

    // ③ 관리자 조치 로그 (대상 기준 1건)
    reportMapper.insertAdminActionLog(request.handlerUserId(), key.targetType(),
        key.targetId(), request.action().name(), request.reason());
  }

  /**
   * 콘텐츠에 반영할 실제 status 문자열. USER 는 status enum 에 HIDDEN 이 없어 제재(SUSPENDED)로 변환.
   */
  private String resolveContentStatus(String targetType, ContentAction action) {
    if ("USER".equals(targetType)) {
      return action == ContentAction.DELETED ? "DELETED" : "SUSPENDED";
    }
    return action.name(); // POST/COMMENT/REVIEW → HIDDEN / DELETED 그대로
  }

  @Override
  @Transactional
  public BulkResult processReports(ReportBulkProcessRequest request) {
    LocalDateTime now = LocalDateTime.now();
    int done = 0;
    int skipped = 0;
    for (Long reportId : request.reportIds()) {
      Report report = reportRepository.findById(reportId)
          .orElseThrow(() -> new BusinessException(ErrorCode.REPORT_NOT_FOUND));
      // 이미 종결(RESOLVED/REJECTED)된 건은 예외 대신 건너뛴다. (엔티티 process()는 종결 건에 예외)
      if (report.getStatus() == ReportStatus.RESOLVED
          || report.getStatus() == ReportStatus.REJECTED) {
        skipped++;
        continue;
      }
      report.process(request.status(), request.handlerUserId(), now, request.reason());
      done++;
    }
    return new BulkResult(done, skipped);
  }

}
