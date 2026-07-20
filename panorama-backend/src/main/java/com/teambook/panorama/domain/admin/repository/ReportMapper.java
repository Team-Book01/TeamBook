package com.teambook.panorama.domain.admin.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.teambook.panorama.domain.admin.dto.report.RelatedReport;
import com.teambook.panorama.domain.admin.dto.report.ReportCore;
import com.teambook.panorama.domain.admin.dto.report.ReportResponse;
import com.teambook.panorama.domain.admin.dto.report.ReportSearchRequest;
import com.teambook.panorama.domain.admin.dto.report.ReportTargetKey;
import com.teambook.panorama.domain.admin.dto.report.ReportTargetView;

/**
 * 관리자 조회 전용 + 신고 처리(대량/다형 쓰기) MyBatis 매퍼. (연관 엔티티가 없어 쓰기도 MyBatis)
 */
@Mapper
public interface ReportMapper {

  // ── 목록 ────────────────────────────────────────────────
  List<ReportResponse> selectReports(ReportSearchRequest request);

  long countReports(ReportSearchRequest request);

  // ── 상세(조립용 3조회) ──────────────────────────────────
  /** 신고 자체 정보 (신고자 마스킹 / 처리자 닉네임 조인) */
  Optional<ReportCore> selectReportCore(@Param("reportId") Long reportId);

  /** 원본 콘텐츠 다형 조회 (target_type 으로 테이블 분기) */
  Optional<ReportTargetView> selectReportTarget(
      @Param("targetType") String targetType, @Param("targetId") Long targetId);

  /** 동일 대상 누적 신고 (자기 자신 제외) */
  List<RelatedReport> selectRelatedReports(
      @Param("reportId") Long reportId,
      @Param("targetType") String targetType,
      @Param("targetId") Long targetId);

  // ── 처리(한 트랜잭션) ──────────────────────────────────
  /** 처리 대상 식별 + 현재 상태(재처리 방지) */
  Optional<ReportTargetKey> selectReportTargetKey(@Param("reportId") Long reportId);

  /** 원본 콘텐츠 status 변경 (타입별 테이블). 변경 행 수 반환 */
  int updateTargetStatus(
      @Param("targetType") String targetType,
      @Param("targetId") Long targetId,
      @Param("status") String status);

  /** 같은 대상의 PENDING/REVIEWING 신고를 모두 RESOLVED 로 (유령 신고 방지) */
  int resolveReportsByTarget(
      @Param("targetType") String targetType,
      @Param("targetId") Long targetId,
      @Param("handlerUserId") Long handlerUserId,
      @Param("processedAt") LocalDateTime processedAt,
      @Param("processReason") String processReason);

  /** 관리자 조치 로그 1건 기록 */
  int insertAdminActionLog(
      @Param("userId") Long userId,
      @Param("targetType") String targetType,
      @Param("targetId") Long targetId,
      @Param("actionType") String actionType,
      @Param("reason") String reason);
}
