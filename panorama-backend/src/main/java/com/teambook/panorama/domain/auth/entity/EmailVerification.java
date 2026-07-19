package com.teambook.panorama.domain.auth.entity;

import com.teambook.panorama.domain.auth.enums.VerificationPurpose;
import com.teambook.panorama.domain.user.entity.User;
import com.teambook.panorama.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "email_verifications")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class EmailVerification extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "email_verification_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VerificationPurpose purpose;

    // 인증 대상 email — EMAIL_VERIFY 행에서만 채운다(PASSWORD_RESET 는 null). confirm 성공 시 users.email 로 승격.
    @Column(name = "target_email")
    private String targetEmail;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean verified;

    @Builder
    private EmailVerification(User user, String token, VerificationPurpose purpose,
                              String targetEmail, LocalDateTime expiresAt) {
        this.user = user;
        this.token = token;
        this.purpose = purpose;
        this.targetEmail = targetEmail;
        this.expiresAt = expiresAt;
        this.verified = false;
    }

    /**
     * 인증 토큰 행 생성.
     * @param token SHA-256 지문(원문 아님). @param targetEmail EMAIL_VERIFY 전용(그 외 null).
     */
    public static EmailVerification of(User user, VerificationPurpose purpose,
                                       String token, LocalDateTime expiresAt, String targetEmail) {
        return EmailVerification.builder()
                .user(user)
                .purpose(purpose)
                .token(token)
                .expiresAt(expiresAt)
                .targetEmail(targetEmail)
                .build();
    }

    /** 만료 여부 확인 (틀) */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    /** 인증 완료 처리 (틀) */
    public void markVerified() {
        this.verified = true;
    }
}