package com.teambook.panorama.domain.admin.entity;

import java.time.LocalDateTime;

import com.teambook.panorama.domain.admin.entity.type.ReportStatus;
import com.teambook.panorama.global.entity.BaseTimeEntity;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 신고 (reports)
 */
@Entity
@Table(name = "reports")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Report extends BaseTimeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "report_id")
  private Long reportId;

  /** 신고자 사용자 ID */
  @Column(name = "reporter_user_id", nullable = false)
  private Long reporterUserId;

  /** 신고 대상 유형 (POST, COMMENT, REVIEW 등) */
  @Column(name = "target_type", nullable = false, length = 50)
  private String targetType;

  /** 신고 대상 ID (DB BIGINT — 대상 테이블 PK를 논리 참조, FK 아님) */
  @Column(name = "target_id", nullable = false)
  private Long targetId;

  /** 신고 사유 유형 */
  @Column(name = "reason_type", nullable = false, length = 50)
  private String reasonType;

  /** 상세 내용 (선택 — 신고자가 추가로 남기는 사유) */
  @Column(name = "content", length = 255)
  private String content;

  /** 처리 상태 (PENDING, REVIEWING, RESOLVED, REJECTED) */
  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  private ReportStatus status;

  /** 처리 담당(관리자) 사용자 ID */
  @Column(name = "handler_user_id")
  private Long handlerUserId;

  /** 처리 시각 */
  @Column(name = "processed_at")
  private LocalDateTime processedAt;

  @Builder
  private Report(Long reporterUserId, String targetType, Long targetId, String reasonType,
      String content, ReportStatus status, Long handlerUserId, LocalDateTime processedAt) {
    this.reporterUserId = reporterUserId;
    this.targetType = targetType;
    this.targetId = targetId;
    this.reasonType = reasonType;
    this.content = content;
    this.status = status != null ? status : ReportStatus.PENDING;
    this.handlerUserId = handlerUserId;
    this.processedAt = processedAt;
  }

  /**
   * 신고 상태 변경(처리). 이미 종결(RESOLVED/REJECTED)된 신고는 다시 처리할 수 없다.
   */
  public void process(ReportStatus status, Long handlerUserId, LocalDateTime processedAt) {
    if (this.status == ReportStatus.RESOLVED || this.status == ReportStatus.REJECTED) {
      throw new BusinessException(ErrorCode.ALREADY_PROCESSED);
    }
    this.status = status;
    this.handlerUserId = handlerUserId;
    this.processedAt = processedAt;
  }
}
