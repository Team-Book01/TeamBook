package com.teambook.panorama.domain.auth.service;

/**
 * 비밀번호 재설정/변경 서비스 (확장 예정). 구현체는 {@link PasswordServiceImpl}.
 */
public interface PasswordService {

    /** 비밀번호 재설정 메일 발송 요청(비로그인). */
    void requestReset(String email);

    /** 비밀번호 재설정 확정(메일 토큰 + 새 비밀번호). */
    void confirmReset(String token, String newPassword);

    /** 로그인 상태에서 비밀번호 변경(현재 비밀번호 확인). */
    void changePassword(Long userId, String currentPassword, String newPassword);
}
