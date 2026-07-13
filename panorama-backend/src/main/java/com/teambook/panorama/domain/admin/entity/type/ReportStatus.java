package com.teambook.panorama.domain.admin.entity.type;

/**
 * 신고 처리 상태
 */
public enum ReportStatus {
  PENDING,    // 접수(대기)
  REVIEWING,  // 검토 중
  RESOLVED,   // 처리 완료
  REJECTED    // 반려
}
