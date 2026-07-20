-- ============================================================
-- V9: 공지사항 이미지(notice_images)
--
-- 공지 본문을 게시글과 같은 에디터로 작성하게 되면서, 본문에 삽입되는 이미지를
-- 같은 방식으로 관리한다. 구조는 post_images 와 동일하다.
--
-- notice_id 가 NULL 허용인 이유: 에디터는 공지를 저장하기 전에 이미지를 먼저 올린다.
-- 그 시점엔 소유자가 없으므로 NULL 로 들어갔다가 공지 저장 시 연결된다.
-- 오래 NULL 로 남은 행 = 쓰다 만 이미지 → 배치 정리 대상 (post_images 와 동일).
-- ============================================================

CREATE TABLE `notice_images` (
    `notice_image_id`    BIGINT        NOT NULL AUTO_INCREMENT COMMENT '공지 이미지 ID',
    `notice_id`          BIGINT        NULL     COMMENT '공지 ID (에디터 선업로드 시점엔 NULL, 저장 시 연결)',
    `image_url`          VARCHAR(1000) NOT NULL COMMENT '이미지 접근 URL (본문에 삽입되는 값)',
    `image_key`          VARCHAR(500)  NOT NULL COMMENT '스토리지 객체 키 — 원본 삭제·URL 재발급에 사용',
    `original_file_name` VARCHAR(255)  NULL     COMMENT '원본 파일명',
    `content_type`       VARCHAR(100)  NOT NULL COMMENT 'MIME 타입',
    `file_size`          BIGINT        NOT NULL COMMENT '파일 크기(byte)',
    `created_at`         DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '업로드 일시 (고아 이미지 정리 기준)',
    `updated_at`         DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '수정 일시',
    PRIMARY KEY (`notice_image_id`),
    CONSTRAINT `UK_NOTICE_IMAGES_IMAGE_KEY` UNIQUE (`image_key`)
);
