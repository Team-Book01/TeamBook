-- ============================================================
-- V3: admin 컬럼 변경 + 도서관 동기화 스키마
--   · notices.view_count : INT → BIGINT
--   · reports            : title 제거 + (신고자,대상) 중복 신고 방지 UNIQUE
--   · library            : phone → tel 로 rename & VARCHAR(100), fax VARCHAR(100),
--                          lib_code UNIQUE(동기화 upsert 기준)
-- ============================================================

-- ─────────────── notices ───────────────
-- 조회수 타입 확장 (엔티티 viewCount = Long)
ALTER TABLE `notices` MODIFY COLUMN `view_count` BIGINT NOT NULL DEFAULT 0 AFTER `is_important`;

-- ─────────────── reports ───────────────
-- 신고 버튼(원클릭) 기반: title 제거(대상은 target_type+target_id 로 식별),
-- 같은 사용자가 같은 대상을 여러 번 신고하지 못하도록 UNIQUE.
ALTER TABLE `reports` DROP COLUMN `title`;
ALTER TABLE `reports`
    ADD CONSTRAINT `UK_REPORTS_REPORTER_TARGET`
    UNIQUE (`reporter_user_id`, `target_type`, `target_id`);

-- ─────────────── library ───────────────
-- 정보나루(data4library) 동기화 지원:
--   · phone → tel 로 컬럼명 변경(API 필드명과 일치) + 길이 확장(대표번호+안내문구로 30자 초과)
--   · fax 도 동일 사유로 확장
--   · lib_code UNIQUE — 동기화 upsert(있으면 update / 없으면 insert)의 기준 키
ALTER TABLE `library`
    CHANGE COLUMN `phone` `tel` VARCHAR(100) NULL COMMENT '전화번호',
    MODIFY COLUMN `fax` VARCHAR(100) NULL COMMENT '팩스번호',
    ADD CONSTRAINT `UK_LIBRARY_LIB_CODE` UNIQUE (`lib_code`);
