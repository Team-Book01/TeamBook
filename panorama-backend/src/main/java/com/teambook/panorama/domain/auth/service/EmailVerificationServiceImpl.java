package com.teambook.panorama.domain.auth.service;

import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.auth.entity.EmailVerification;
import com.teambook.panorama.domain.auth.enums.VerificationPurpose;
import com.teambook.panorama.domain.auth.repository.EmailVerificationRepository;
import com.teambook.panorama.domain.user.entity.User;
import com.teambook.panorama.domain.user.repository.UserRepository;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;
import com.teambook.panorama.global.mail.MailService;
import com.teambook.panorama.global.security.jwt.TokenHashUtil;
import com.teambook.panorama.global.security.util.TokenGenerator;

import lombok.RequiredArgsConstructor;

/**
 * 이메일 등록·인증.
 *
 * <p>인증이 완료된 이메일만 users.email 에 저장한다. 인증 대기 중인 이메일은 users 를 건드리지 않고
 * email_verifications.target_email 에만 담아두었다가, 인증(confirm) 성공 시점에만 users.email 로 승격한다.
 *
 * <p>토큰은 원문을 DB에 저장하지 않고 SHA-256 지문만 저장한다(원문은 메일 링크에만 존재). 조회할 때
 * 들어온 원문을 다시 해시해서 대조한다. email_verifications 테이블은 비밀번호 재설정과 공유하므로
 * 조회는 항상 (지문, purpose) 로 하여 교차 사용을 막는다.
 */
@Service
@RequiredArgsConstructor
public class EmailVerificationServiceImpl implements EmailVerificationService {

    // 이메일 인증 토큰 유효시간 30분.
    private static final Duration VERIFY_TTL = Duration.ofMinutes(30);

    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final TokenGenerator tokenGenerator;
    private final TokenHashUtil tokenHashUtil;
    private final MailService mailService;

    @Override
    @Transactional
    public void requestVerification(Long userId, String email) {
        // 1차 중복 차단: 이미 누군가 인증해 쓰고 있는 주소면 요청 단계에서 막는다.
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_USED);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 같은 유저의 이전 이메일 인증 토큰을 먼저 지운다(유효 토큰은 마지막 하나만).
        // delete 를 save 보다 먼저 해야 유효 토큰이 잠깐 둘이 되는 상황을 피한다.
        emailVerificationRepository.deleteByUserAndPurpose(user, VerificationPurpose.EMAIL_VERIFY);

        String rawToken = tokenGenerator.generate();                 // 원문은 메일에만 존재
        emailVerificationRepository.save(EmailVerification.of(
                user,
                VerificationPurpose.EMAIL_VERIFY,
                tokenHashUtil.sha256Hex(rawToken),                   // DB에는 지문만 저장
                LocalDateTime.now().plus(VERIFY_TTL),
                email));                                             // 인증 대기 주소는 target_email 에 보관

        // 메일 발송은 트랜잭션 안에서 동기로 호출한다.
        // SMTP 실패 시 함께 롤백되어 "메일은 못 보냈는데 토큰만 남는" 불일치가 생기지 않는다.
        mailService.sendEmailVerificationMail(email, rawToken);
    }

    @Override
    @Transactional
    public void confirmVerification(String token) {
        EmailVerification ev = validateAndConsume(token);            // 토큰 검증 + 1회용 소진

        // 2차 중복 차단: 요청~확인 사이에 다른 유저가 같은 주소를 먼저 인증하는 경쟁 상태를 방어한다.
        // 최후 방어선은 users.email 의 UNIQUE 제약(동시 커밋 시 하나는 제약 위반으로 실패).
        if (userRepository.existsByEmail(ev.getTargetEmail())) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_USED);
        }

        ev.getUser().registerVerifiedEmail(ev.getTargetEmail());     // users.email 로 승격(dirty checking)

        // existsByEmail 통과 후 커밋 전 찰나에 다른 유저가 같은 주소를 확정하는 경쟁이 남아 있다.
        // dirty checking UPDATE 는 트랜잭션 커밋 시점에 flush 되므로, 그대로 두면 UNIQUE 위반이
        // 메서드 밖에서 터져 500 이 된다. 여기서 명시적으로 flush 해 위반을 이 자리에서 표면화하고,
        // A010(이미 사용 중인 이메일)으로 변환한다.
        try {
            userRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_USED);
        }
    }

    /**
     * (지문, EMAIL_VERIFY) 로 조회 → 만료/재사용 차단 → 소진 처리(markVerified) 후 반환한다.
     * 실패 사유(없음/만료/사용됨)를 구분하지 않고 전부 같은 코드로 응답한다(계정·토큰 상태 열거 방지).
     */
    private EmailVerification validateAndConsume(String rawToken) {
        EmailVerification ev = emailVerificationRepository
                .findByTokenAndPurpose(tokenHashUtil.sha256Hex(rawToken), VerificationPurpose.EMAIL_VERIFY)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_VERIFICATION_TOKEN));

        if (ev.isExpired() || ev.isVerified()) {
            throw new BusinessException(ErrorCode.INVALID_VERIFICATION_TOKEN);
        }

        ev.markVerified();   // 소진 처리. 같은 링크를 다시 클릭하면 다음부터 isVerified() 에 걸려 실패(1회용).
        return ev;
    }
}
