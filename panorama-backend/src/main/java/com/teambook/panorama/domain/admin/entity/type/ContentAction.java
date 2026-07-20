package com.teambook.panorama.domain.admin.entity.type;

/**
 * 관리자가 원본 콘텐츠에 취하는 조치.
 *
 * <p>POST/COMMENT/REVIEW 는 그대로 status 값(ACTIVE/HIDDEN/DELETED)이 되고,
 * USER 대상은 서비스에서 HIDDEN→SUSPENDED(제재)로 변환한다.</p>
 *
 * <p>ACTIVE 는 콘텐츠 관리 화면의 숨김 해제 전용이다. 신고 처리(ReportProcessRequest)는
 * "조치를 취했다"를 기록하는 API 라 되돌리기를 받지 않으며 서비스에서 거부한다.</p>
 */
public enum ContentAction {
  ACTIVE,   // 공개로 되돌리기 (숨김 해제)
  HIDDEN,   // 숨김
  DELETED   // 삭제
}
