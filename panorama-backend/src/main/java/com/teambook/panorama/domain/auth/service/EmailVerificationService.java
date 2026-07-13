package com.teambook.panorama.domain.auth.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    // TODO: 확장 기능 - 이메일 인증. 핵심 기능 완성 후 구현 예정.

    /**
     * 이메일 인증 요청: 토큰 생성 후 메일 발송
     * TODO:
     *  1. 인증 토큰 생성 (UUID 등)
     *  2. EmailVerification 저장 (만료시간 30분)
     *  3. 사용자 이메일로 인증 링크 발송 (SMTP - 미구현)
     */
    @Transactional
    public void requestVerification(Long userId) {
        throw new UnsupportedOperationException("이메일 인증 기능 미구현 (확장 예정)");
    }

    /**
     * 인증 링크 클릭 처리: 토큰 검증 후 User.emailVerified = true
     * TODO:
     *  1. 토큰으로 EmailVerification 조회
     *  2. 만료·중복 검증
     *  3. user.verifyEmail() 호출
     */
    @Transactional
    public void confirmVerification(String token) {
        throw new UnsupportedOperationException("이메일 인증 기능 미구현 (확장 예정)");
    }

    /**
     * 비밀번호 재설정: 이메일 인증된 유저만 가능
     * TODO:
     *  1. user.isEmailVerified() 확인 (false면 차단)
     *  2. 새 비밀번호 BCrypt 해싱
     *  3. user.updatePassword(...) 호출
     */
    @Transactional
    public void resetPassword(Long userId, String newPassword) {
        throw new UnsupportedOperationException("이메일 인증 기능 미구현 (확장 예정)");
    }
}