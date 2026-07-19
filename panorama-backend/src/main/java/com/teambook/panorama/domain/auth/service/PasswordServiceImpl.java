package com.teambook.panorama.domain.auth.service;

import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.auth.entity.EmailVerification;
import com.teambook.panorama.domain.auth.enums.VerificationPurpose;
import com.teambook.panorama.domain.auth.repository.EmailVerificationRepository;
import com.teambook.panorama.domain.user.entity.User;
import com.teambook.panorama.domain.user.enums.Provider;
import com.teambook.panorama.domain.user.repository.UserRepository;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;
import com.teambook.panorama.global.mail.MailService;
import com.teambook.panorama.global.security.jwt.TokenHashUtil;
import com.teambook.panorama.global.security.util.TokenGenerator;

import lombok.RequiredArgsConstructor;

/**
 * 비밀번호 재설정(비로그인)/변경(로그인) 서비스.
 *
 * <p>재설정은 등록·인증된 이메일로 토큰 링크를 보내고, 그 토큰과 새 비밀번호로 교체한다.
 * 이메일 인증과 동일한 토큰 방식을 공유한다(email_verifications 테이블·랜덤 토큰·SHA-256 지문·purpose).
 * 재설정 토큰은 purpose = PASSWORD_RESET 로 구분한다.
 */
@Service
@RequiredArgsConstructor
public class PasswordServiceImpl implements PasswordService {

    // 비밀번호 재설정 토큰 유효시간 15분. 탈취 창을 줄이려 이메일 인증(30분)보다 짧게 둔다.
    private static final Duration RESET_TTL = Duration.ofMinutes(15);

    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenGenerator tokenGenerator;
    private final TokenHashUtil tokenHashUtil;
    private final MailService mailService;

    /**
     * 비밀번호 재설정 메일 발송 요청(비로그인).
     *
     * <p>가입 여부를 노출하지 않기 위해 컨트롤러는 계정 유무와 무관하게 항상 202 를 응답한다.
     * 그래서 여기서는 해당 이메일의 LOCAL 계정이 있을 때만 조용히 실행하고, 없으면 아무 일도 하지 않는다.
     */
    @Transactional
    public void requestReset(String email) {
        userRepository.findByEmailAndProvider(email, Provider.LOCAL).ifPresent(user -> {
            // 같은 유저의 이전 재설정 토큰을 먼저 지운다(유효 토큰은 마지막 하나만). delete → save 순서.
            emailVerificationRepository.deleteByUserAndPurpose(user, VerificationPurpose.PASSWORD_RESET);

            String rawToken = tokenGenerator.generate();                 // 원문은 메일에만 존재
            emailVerificationRepository.save(EmailVerification.of(
                    user,
                    VerificationPurpose.PASSWORD_RESET,
                    tokenHashUtil.sha256Hex(rawToken),                   // DB에는 지문만 저장
                    LocalDateTime.now().plus(RESET_TTL),
                    null));                                              // target_email 은 이메일 인증 전용이라 여기선 null

            // 메일 발송은 트랜잭션 안 동기 호출 — 실패 시 토큰 저장까지 함께 롤백된다.
            mailService.sendPasswordResetMail(email, rawToken);
        });
    }

    /**
     * 비밀번호 재설정 확정(메일 토큰 + 새 비밀번호).
     * 토큰 실패(없음/만료/사용됨)는 사유를 구분하지 않고 전부 같은 코드로 응답한다(열거 방지).
     */
    @Transactional
    public void confirmReset(String token, String newPassword) {
        EmailVerification ev = emailVerificationRepository
                .findByTokenAndPurpose(tokenHashUtil.sha256Hex(token), VerificationPurpose.PASSWORD_RESET)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_RESET_TOKEN));

        if (ev.isExpired() || ev.isVerified()) {
            throw new BusinessException(ErrorCode.INVALID_RESET_TOKEN);
        }

        ev.markVerified();   // 재설정 토큰은 1회용 — 소진 처리해 같은 토큰 재사용을 막는다.
        ev.getUser().updatePassword(passwordEncoder.encode(newPassword)); // dirty checking으로 UPDATE
    }

    /**
     * 로그인 상태에서 비밀번호 변경(현재 비밀번호 확인).
     */
    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND)); // U001

        // 현재 비밀번호 대조 — 틀리면 A009
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BusinessException(ErrorCode.PASSWORD_MISMATCH); // A009
        }

        user.updatePassword(passwordEncoder.encode(newPassword)); // dirty checking으로 UPDATE
    }
}
