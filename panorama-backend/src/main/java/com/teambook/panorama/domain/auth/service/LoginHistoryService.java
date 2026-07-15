package com.teambook.panorama.domain.auth.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.teambook.panorama.domain.auth.dto.LoginHistoryDto;
import com.teambook.panorama.domain.user.enums.Provider;

/**
 * 로그인 이력(login history) 서비스. 구현체는 {@link LoginHistoryServiceImpl}.
 */
public interface LoginHistoryService {

    /** 로그인 성공 이력 기록. */
    void recordSuccess(Long userId, Provider provider);

    /** 로컬 로그인 실패 이력 기록 (userId 는 없으면 null). */
    void recordFailLocal(Long userIdOrNull, String attemptedLoginId, Provider provider);

    /** 마지막 로그인 성공 시각 조회. */
    Optional<LocalDateTime> findLastSuccessAt(Long userId);

    /** 내 로그인 이력 목록 조회. */
    List<LoginHistoryDto.Response> getMyHistories(Long userId);
}
