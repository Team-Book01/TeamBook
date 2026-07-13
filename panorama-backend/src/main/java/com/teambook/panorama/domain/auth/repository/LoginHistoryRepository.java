package com.teambook.panorama.domain.auth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.auth.entity.LoginHistory;
import com.teambook.panorama.domain.auth.enums.LoginResult;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long>{

  // 이력 목록 (최신순)
  List<LoginHistory> findByUserIdOrderByAttemptedAtDesc(Long userId);

  // "마지막 로그인 시각"
  Optional<LoginHistory> findFirstByUserIdAndResultOrderByAttemptedAtDesc(
          Long userId, LoginResult result);

}
