package com.teambook.panorama.domain.auth.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

/**
 * 비밀번호 재설정/변경 서비스.
 *
 * <p>현재는 API 명세(컨트롤러·Swagger)만 확정하고 로직은 확장 예정 상태다.
 * 각 메서드는 아직 {@link UnsupportedOperationException}을 던진다(SMTP 미설정).
 * 이메일 토큰은 기존 {@code email_verifications} 테이블 / {@code EmailVerification}을 재사용할 예정.
 */
@Service
@RequiredArgsConstructor
public class PasswordServiceImpl implements PasswordService {

    // TODO: 확장 기능 - 비밀번호 재설정/변경. SMTP 설정 후 구현 예정.

    /**
     * 비밀번호 재설정 메일 발송 요청(비로그인).
     * TODO:
     *  1. email로 Local User 조회 (없어도 이메일 열거 방지 위해 동일 응답 권장)
     *  2. 재설정 토큰 생성(UUID) + EmailVerification 저장(만료 30분)
     *  3. 재설정 링크를 사용자 이메일로 발송 (SMTP - 미구현)
     */
    @Transactional
    public void requestReset(String email) {
        throw new UnsupportedOperationException("비밀번호 재설정 기능 미구현 (확장 예정)");
    }

    /**
     * 비밀번호 재설정 확정(메일 토큰 + 새 비밀번호).
     * TODO:
     *  1. token으로 EmailVerification 조회 (없으면 A008)
     *  2. 만료·사용여부 검증 (만료면 A008)
     *  3. 새 비밀번호 BCrypt 해싱 후 user.updatePassword(...) + 토큰 사용 처리
     */
    @Transactional
    public void confirmReset(String token, String newPassword) {
        throw new UnsupportedOperationException("비밀번호 재설정 기능 미구현 (확장 예정)");
    }

    /**
     * 로그인 상태에서 비밀번호 변경(현재 비밀번호 확인).
     * TODO:
     *  1. userId로 User 조회 (없으면 U001)
     *  2. currentPassword vs 저장된 해시 대조 (불일치면 A009)
     *  3. 새 비밀번호 BCrypt 해싱 후 user.updatePassword(...)
     */
    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        throw new UnsupportedOperationException("비밀번호 변경 기능 미구현 (확장 예정)");
    }
}
