-- ============================================================
-- V2: User, Auth 엔티티(JPA) 매핑과 V1 스키마 정합화
-- Email 인증을 위한 email_verifications 테이블 추가
-- email_verifications 추가에따른 users 테이블 변경
-- ============================================================

-- ─────────────── email_verification ───────────────
CREATE TABLE email_verifications (
    email_verification_id BIGINT       NOT NULL AUTO_INCREMENT,
    user_id               BIGINT       NOT NULL COMMENT '사용자 FK',
    token                 VARCHAR(255) NOT NULL COMMENT '인증 토큰',
    expires_at            DATETIME(6)  NOT NULL COMMENT '만료 시각',
    verified              TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '인증 완료 여부',
    created_at            DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at            DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (email_verification_id),
    CONSTRAINT fk_email_verification_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
);

-- ─────────────── users ───────────────
ALTER TABLE `users`
    ADD CONSTRAINT `UK_USERS_NICKNAME` UNIQUE (`nickname`);

ALTER TABLE `users`
    ADD CONSTRAINT `UK_USERS_LOGIN_ID` UNIQUE (`login_id`);

-- User.loginId: 소셜 유저(createSocialUser)는 login_id 를 NULL 로 두므로 NULL 허용
--   (엔티티의 @Column(nullable = false) 표기는 재검토 권장)
ALTER TABLE `users`
    MODIFY `login_id` VARCHAR(20) NULL COMMENT 'Local 회원가입시 입력, 소셜 NULL';

ALTER TABLE users
    ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0 COMMENT '이메일 인증 여부';

-- ─────────────── refresh_tokens ───────────────
ALTER TABLE `refresh_tokens`
    ADD CONSTRAINT `UK_REFRESH_TOKENS_TOKEN_HASH` UNIQUE (`token_hash`);

-- ─────────────── social_accounts ───────────────

ALTER TABLE `social_accounts`
    DROP INDEX `UK_SOCIAL_ACCOUNTS_PROVIDER_USER`;
ALTER TABLE `social_accounts`
    ADD CONSTRAINT `UK_SOCIAL_PROVIDER_USER` UNIQUE (`provider`, `provider_user_id`);

-- SocialAccount 의 @ManyToOne(user) → users FK 추가 (V1 엔 FK 제약이 없음)
ALTER TABLE `social_accounts`
    ADD CONSTRAINT `FK_SOCIAL_ACCOUNTS_USER`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);


