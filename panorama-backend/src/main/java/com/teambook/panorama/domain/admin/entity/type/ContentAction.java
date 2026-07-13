package com.teambook.panorama.domain.admin.entity.type;

/**
 * 신고 처리 시 원본 콘텐츠에 취하는 조치.
 *
 * <p>POST/COMMENT/REVIEW 는 그대로 status 값(HIDDEN/DELETED)이 되고,
 * USER 대상은 서비스에서 HIDDEN→SUSPENDED(제재)로 변환한다.</p>
 */
public enum ContentAction {
  HIDDEN,   // 숨김
  DELETED   // 삭제
}
