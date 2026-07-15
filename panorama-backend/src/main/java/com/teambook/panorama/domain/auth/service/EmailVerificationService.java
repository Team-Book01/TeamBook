package com.teambook.panorama.domain.auth.service;

/**
 * 이메일 인증 서비스 (확장 예정). 구현체는 {@link EmailVerificationServiceImpl}.
 */
public interface EmailVerificationService {

    /** 이메일 인증 요청: 토큰 생성 후 메일 발송. */
    void requestVerification(Long userId);

    /** 인증 링크 클릭 처리: 토큰 검증 후 이메일 인증 완료. */
    void confirmVerification(String token);

    /** 비밀번호 재설정: 이메일 인증된 유저만 가능. */
    void resetPassword(Long userId, String newPassword);
}
