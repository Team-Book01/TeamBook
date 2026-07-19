package com.teambook.panorama.domain.auth.repository;

import com.teambook.panorama.domain.auth.entity.EmailVerification;
import com.teambook.panorama.domain.auth.enums.VerificationPurpose;
import com.teambook.panorama.domain.user.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailVerificationRepository
        extends JpaRepository<EmailVerification, Long> {

    // 조회는 반드시 purpose 까지 함께 대조한다.
    // 하나의 테이블(email_verifications)을 이메일 인증(EMAIL_VERIFY)과 비밀번호 재설정(PASSWORD_RESET)이
    // 공유하므로, purpose 를 빼면 재설정 토큰으로 이메일 인증을 통과시키는 교차 사용이 가능해진다.
    // 인자 token 은 원문이 아니라 SHA-256 지문이다.
    Optional<EmailVerification> findByTokenAndPurpose(String token, VerificationPurpose purpose);

    // 새 토큰 발급 전에 같은 (user, purpose) 의 이전 토큰을 지운다(유저·용도당 유효 토큰은 마지막 하나만).
    // 반드시 delete → save 순서로 호출한다. 먼저 저장하면 유효 토큰이 잠깐 둘이 된다.
    void deleteByUserAndPurpose(User user, VerificationPurpose purpose);
}
