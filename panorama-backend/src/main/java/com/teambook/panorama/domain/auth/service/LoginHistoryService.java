package com.teambook.panorama.domain.auth.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.auth.entity.LoginHistory;
import com.teambook.panorama.domain.auth.enums.LoginResult;
import com.teambook.panorama.domain.auth.repository.LoginHistoryRepository;
import com.teambook.panorama.domain.user.enums.Provider;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LoginHistoryService {

    private final LoginHistoryRepository loginHistoryRepository;

    @Transactional
    public void recordSuccess(Long userId, Provider provider) {
        loginHistoryRepository.save(LoginHistory.success(userId, provider));
    }

    @Transactional
    public void recordFailLocal(Long userIdOrNull, String attemptedLoginId, Provider provider) {
        loginHistoryRepository.save(
                LoginHistory.failLocal(userIdOrNull, truncate20(attemptedLoginId), provider)
        );
    }

    // "마지막 로그인 시각"(구 last_login_at) 파생 조회
    @Transactional(readOnly = true)
    public Optional<LocalDateTime> findLastSuccessAt(Long userId) {
        return loginHistoryRepository
                .findFirstByUserIdAndResultOrderByAttemptedAtDesc(userId, LoginResult.SUCCESS)
                .map(LoginHistory::getAttemptedAt);   // 컬럼은 attempted_at, 프로퍼티는 createdAt
    }

    private String truncate20(String s) {
        if (s == null) return null;
        return s.length() > 20 ? s.substring(0, 20) : s;
    }
}
