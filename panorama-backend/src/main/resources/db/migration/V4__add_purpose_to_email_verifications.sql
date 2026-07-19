-- ============================================================
-- V4: email_verifications 에 purpose 컬럼 추가
--   Redis 대신 DB로 인증 토큰/코드를 관리하며, 한 테이블을 두 용도로 사용한다.
--   목적을 구분하기 위한 컬럼:
--     · EMAIL_VERIFY   : 계정에 이메일 연동(등록) 인증
--     · PASSWORD_RESET : 비밀번호 초기화 인증
-- ============================================================

ALTER TABLE `email_verifications`
    ADD COLUMN `purpose` VARCHAR(20) NOT NULL DEFAULT 'EMAIL_VERIFY'
        COMMENT '인증 목적: EMAIL_VERIFY(이메일 연동) / PASSWORD_RESET(비밀번호 초기화)'
        AFTER `user_id`;

ALTER TABLE `email_verifications`
ADD COLUMN `target_email` VARCHAR(255) NULL
    COMMENT '인증 대상 email (EMAIL_VERIFY 전용, confirm 시 users.email로 승격)'
    AFTER `purpose`;

-- token(SHA-256 지문)은 랜덤 256비트라 전역 유일 → 조회 인덱스 + 중복 방지(무결성) 겸용.
ALTER TABLE `email_verifications`
    ADD CONSTRAINT `UK_EMAIL_VERIFICATIONS_TOKEN` UNIQUE (`token`);

ALTER TABLE `users`
    ADD CONSTRAINT `UK_USERS_EMAIL` UNIQUE (`email`);

ALTER TABLE `users`
    DROP COLUMN `email_verified`;