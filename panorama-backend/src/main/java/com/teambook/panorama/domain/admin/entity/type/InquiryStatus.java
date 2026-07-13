package com.teambook.panorama.domain.admin.entity.type;

/**
 * 문의 처리 상태
 */
public enum InquiryStatus {
  PENDING,   // 접수(답변 대기)
  ANSWERED,  // 답변 완료
  CLOSED,    // 종료
  DELETED    // 삭제(soft delete)
}
