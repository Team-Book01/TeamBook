package com.teambook.panorama.domain.admin.entity.type;

/**
 * 관리자의 사용자 제재 조치. users.status 로 매핑된다.
 */
public enum UserAction {
  SUSPEND,    // 정지  → SUSPENDED
  ACTIVATE,   // 정지 해제 → ACTIVE
  DELETE      // 탈퇴 처리 → DELETED
}
