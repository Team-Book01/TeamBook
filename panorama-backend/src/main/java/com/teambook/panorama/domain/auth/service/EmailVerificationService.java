package com.teambook.panorama.domain.auth.service;

/**
 * 이메일 등록·인증 서비스. 구현체는 {@link EmailVerificationServiceImpl}.
 */
public interface EmailVerificationService {

    /** 인증 요청: (로그인 유저가) email 등록 → 토큰 생성·저장 → 인증 메일 발송. */
    void requestVerification(Long userId, String email);

    /** 인증 콜백: 메일 링크의 토큰 검증 → users.email 로 승격(인증 완료). */
    void confirmVerification(String token);
}
