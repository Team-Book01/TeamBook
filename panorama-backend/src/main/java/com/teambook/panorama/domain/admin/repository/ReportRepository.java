package com.teambook.panorama.domain.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.admin.entity.Report;

/**
 * 신고 쓰기(상태 변경) 전용 JPA 리포지토리.
 * 조회(목록·상세)는 MyBatis(AdminMapper)를 사용한다. (CONVENTIONS.md §8)
 */
public interface ReportRepository extends JpaRepository<Report, Long> {

  /** 같은 사용자가 같은 대상을 이미 신고했는지 (중복 신고 방지) */
  boolean existsByReporterUserIdAndTargetTypeAndTargetId(
      Long reporterUserId, String targetType, Long targetId);
}
