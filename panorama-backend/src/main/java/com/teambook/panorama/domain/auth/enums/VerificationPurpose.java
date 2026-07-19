package com.teambook.panorama.domain.auth.enums;

/**
 * 이메일 인증(email_verifications) 토큰의 사용 목적.
 * 한 테이블을 두 흐름에서 공용으로 쓰므로 목적으로 구분한다.
 */
public enum VerificationPurpose {
    EMAIL_VERIFY,    // 계정에 이메일 연동(등록) 인증
    PASSWORD_RESET   // 비밀번호 초기화 인증
}
