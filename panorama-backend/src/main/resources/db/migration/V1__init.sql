-- ============================================================
-- V1: 초기 스키마
-- ============================================================

-- ─────────────── 테이블 생성 ───────────────

CREATE TABLE `inquiry_answers` (
	`inquiry_answer_id`	BIGINT	NOT NULL	COMMENT '문의 답변 ID',
	`inquiry_id`	BIGINT	NOT NULL	COMMENT '문의 ID',
	`user_id`	BIGINT	NOT NULL	COMMENT '답변 작성 관리자(유저) ID',
	`content`	TEXT	NOT NULL	COMMENT '답변 내용',
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '생성 일시',
	`updated_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '수정 일시'
);

CREATE TABLE `post_comments` (
	`comment_id`	BIGINT	NOT NULL	COMMENT '댓글 ID',
	`post_id`	BIGINT	NOT NULL	COMMENT '게시글 ID',
	`user_id`	BIGINT	NOT NULL	COMMENT '작성자 (users.user_id)',
	`parent_comment_id`	BIGINT	NULL	COMMENT '루트 댓글 ID (NULL=루트, 깊이 2단계 고정 — 대댓글의 부모는 항상 루트)',
	`content`	TEXT	NOT NULL	COMMENT '내용 (@닉네임 멘션은 텍스트로 포함)',
	`status`	VARCHAR(20)	NOT NULL	DEFAULT 'ACTIVE'	COMMENT 'enum {ACTIVE / DELETED / HIDDEN}. 전환 시 updated_at이 처리 시각',
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '생성 일시',
	`updated_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '수정 일시'
);

CREATE TABLE `posts` (
	`post_id`	BIGINT	NOT NULL	COMMENT '게시글 ID',
	`user_id`	BIGINT	NOT NULL	COMMENT '작성자 (users.user_id)',
	`book_id`	BIGINT	NULL	COMMENT '연관 도서 (FREE는 NULL 가능)',
	`category`	VARCHAR(20)	NOT NULL	COMMENT 'enum {RECOMMEND / REVIEW / FREE}',
	`title`	VARCHAR(255)	NOT NULL	COMMENT '제목',
	`content`	MEDIUMTEXT	NOT NULL	COMMENT '본문 (인라인 이미지 참조 포함)',
	`ocr_isbn`	VARCHAR(20)	NULL	COMMENT 'OCR로 인식한 ISBN 원문 (REVIEW 도서 인증용)',
	`is_book_verified`	BOOLEAN	NOT NULL	DEFAULT FALSE	COMMENT 'OCR 도서 인증 성공 여부',
	`view_count`	INT	NOT NULL	DEFAULT 0	COMMENT '조회수',
	`status`	VARCHAR(20)	NOT NULL	DEFAULT 'ACTIVE'	COMMENT 'enum {ACTIVE / DELETED / HIDDEN}. DELETED/HIDDEN 전환 시 updated_at이 처리 시각',
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '생성 일시',
	`updated_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '수정 일시'
);

CREATE TABLE `notifications` (
	`notification_id`	BIGINT	NOT NULL	COMMENT '알림 ID',
	`user_id`	BIGINT	NOT NULL	COMMENT '수신 유저 ID',
	`actor_user_id`	BIGINT	NULL	COMMENT '행위 유저 ID (알림을 유발한 유저)',
	`notification_type`	VARCHAR(30)	NOT NULL	COMMENT '알림 유형',
	`content`	VARCHAR(500)	NOT NULL	COMMENT '알림 내용',
	`target_type`	VARCHAR(30)	NULL	COMMENT '대상 타입 (POST, COMMENT 등)',
	`target_id`	BIGINT	NULL	COMMENT '대상 ID',
	`is_read`	BOOLEAN	NOT NULL	DEFAULT FALSE	COMMENT '읽음 여부',
	`read_at`	DATETIME(6)	NULL	COMMENT '읽은 일시',
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '생성 일시'
);

CREATE TABLE `library` (
	`lib_id`	BIGINT	NOT NULL	COMMENT '도서관 PK',
	`lib_code`	VARCHAR(20)	NOT NULL	COMMENT '도서관 코드',
	`name`	VARCHAR(200)	NOT NULL	COMMENT '도서관명',
	`address`	VARCHAR(500)	NOT NULL	COMMENT '주소',
	`phone`	VARCHAR(30)	NULL	COMMENT '전화번호',
	`fax`	VARCHAR(30)	NULL	COMMENT '팩스번호',
	`latitude`	DECIMAL(10, 7)	NOT NULL	COMMENT '위도',
	`longitude`	DECIMAL(10, 7)	NOT NULL	COMMENT '경도',
	`homepage_url`	VARCHAR(500)	NULL	COMMENT '홈페이지 URL',
	`closed_days`	VARCHAR(500)	NULL	COMMENT '휴관일',
	`operating_hours`	TEXT	NULL	COMMENT '운영시간',
	`book_count`	INT	NULL	COMMENT '소장 도서 수',
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '생성 일시',
	`updated_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '수정 일시'
);

CREATE TABLE `post_scraps` (
	`post_scrap_id`	BIGINT	NOT NULL	COMMENT '스크랩 ID',
	`post_id`	BIGINT	NOT NULL	COMMENT '게시글 ID',
	`user_id`	BIGINT	NOT NULL	COMMENT '스크랩한 유저 ID',
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '스크랩 일시'
);

CREATE TABLE `post_comment_likes` (
	`comment_like_id`	BIGINT	NOT NULL	COMMENT '댓글 추천 ID',
	`comment_id`	BIGINT	NOT NULL	COMMENT '댓글 ID',
	`user_id`	BIGINT	NOT NULL	COMMENT '추천한 유저 ID',
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '추천 일시'
);

CREATE TABLE `reports` (
	`report_id`	BIGINT	NOT NULL	COMMENT '신고 ID',
	`reporter_user_id`	BIGINT	NOT NULL	COMMENT '신고자 유저 ID',
	`target_type`	VARCHAR(30)	NOT NULL	COMMENT '신고 대상 타입 (POST, COMMENT, USER 등)',
	`target_id`	BIGINT	NOT NULL	COMMENT '신고 대상 ID',
	`reason_type`	VARCHAR(30)	NOT NULL	COMMENT '신고 사유 유형',
	`title`	VARCHAR(255)	NOT NULL	COMMENT '신고 제목',
	`content`	VARCHAR(255)	NULL	COMMENT '신고 상세 내용',
	`status`	VARCHAR(20)	NOT NULL	DEFAULT 'PENDING'	COMMENT '처리 상태 (PENDING, REVIEWING, RESOLVED, REJECTED)',
	`handler_user_id`	BIGINT	NULL	COMMENT '처리 담당자 유저 ID',
	`processed_at`	DATETIME(6)	NULL	COMMENT '처리 일시',
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '생성 일시',
	`updated_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '수정 일시'
);

CREATE TABLE `admin_action_log` (
	`admin_action_log_id`	BIGINT	NOT NULL,
	`user_id`	BIGINT	NOT NULL,
	`target_type`	VARCHAR(30)	NOT NULL,
	`target_id`	BIGINT	NOT NULL,
	`action_type`	VARCHAR(30)	NOT NULL,
	`reason`	VARCHAR(500)	NULL,
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)
);

CREATE TABLE `post_images` (
	`post_image_id`	BIGINT	NOT NULL	COMMENT '게시글 이미지 ID',
	`post_id`	BIGINT	NULL	COMMENT '게시글 ID (에디터 선업로드 시점엔 NULL, 글 저장 시 연결. NULL 장기 유지 = 고아 이미지 → 배치 정리 대상)',
	`image_url`	VARCHAR(1000)	NOT NULL	COMMENT '이미지 접근 URL (본문에 삽입되는 값)',
	`image_key`	VARCHAR(500)	NOT NULL	COMMENT '스토리지(S3 등) 객체 키 — 원본 삭제·URL 재발급에 사용',
	`original_file_name`	VARCHAR(255)	NULL	COMMENT '원본 파일명',
	`content_type`	VARCHAR(100)	NOT NULL	COMMENT 'MIME 타입',
	`file_size`	BIGINT	NOT NULL	COMMENT '파일 크기(byte)',
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '업로드 일시 (고아 이미지 정리 기준)'
);

CREATE TABLE `post_likes` (
	`post_like_id`	BIGINT	NOT NULL	COMMENT '추천 ID',
	`post_id`	BIGINT	NOT NULL	COMMENT '게시글 ID',
	`user_id`	BIGINT	NOT NULL	COMMENT '추천한 유저 ID',
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '추천 일시'
);

CREATE TABLE `inquiry_images` (
	`inquiry_image_id`	BIGINT	NOT NULL	COMMENT '문의 이미지 ID',
	`inquiry_id`	BIGINT	NOT NULL	COMMENT '문의 ID',
	`image_url`	VARCHAR(1000)	NOT NULL	COMMENT '이미지 접근 URL',
	`image_key`	VARCHAR(500)	NOT NULL	COMMENT '스토리지 키',
	`original_file_name`	VARCHAR(255)	NULL	COMMENT '원본 파일명',
	`content_type`	VARCHAR(100)	NOT NULL	COMMENT 'MIME 타입',
	`file_size`	BIGINT	NOT NULL	COMMENT '파일 크기(byte)',
	`sort_order`	INT	NOT NULL	DEFAULT 0	COMMENT '정렬 순서',
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '생성 일시'
);

CREATE TABLE `book_reviews` (
	`review_id`	BIGINT	NOT NULL	COMMENT '리뷰id',
	`user_id`	BIGINT	NOT NULL	COMMENT '작성자id',
	`book_id`	BIGINT	NOT NULL	COMMENT '책id',
	`rating`	DECIMAL(2,1)	NOT NULL	COMMENT '별점',
	`content`	TEXT	NULL	COMMENT '리뷰내용',
	`status`	VARCHAR(20)	NOT NULL	DEFAULT 'ACTIVE'	COMMENT '상태',
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6),
	`updated_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)
);

CREATE TABLE `login_histories` (
	`login_history_id`	BIGINT	NOT NULL	COMMENT '이력 ID',
	`user_id`	BIGINT	NULL	COMMENT '로그인한 User (실패·미상 시 NULL)',
	`attempted_login_id`	VARCHAR(20)	NULL	COMMENT '시도한 loginId (단순 String, 소셜은 NULL)',
	`provider`	VARCHAR(20)	NOT NULL	COMMENT 'enum(LOCAL / GOOGLE / NAVER / KAKAO)',
	`result`	VARCHAR(20)	NOT NULL	COMMENT 'enum{SUCCESS / FAIL}',
	`attempted_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '로그인 시도 시간'
);

CREATE TABLE `inquiries` (
	`inquiry_id`	BIGINT	NOT NULL	COMMENT '문의 ID',
	`user_id`	BIGINT	NOT NULL	COMMENT '작성 유저 ID',
	`category`	VARCHAR(30)	NOT NULL	COMMENT '문의분류',
	`title`	VARCHAR(255)	NOT NULL	COMMENT '제목',
	`content`	TEXT	NOT NULL	COMMENT '내용',
	`status`	VARCHAR(20)	NOT NULL	DEFAULT 'PENDING'	COMMENT '처리 상태 (PENDING, ANSWERED, DELETED)',
	`is_secret`	BOOLEAN	NOT NULL	DEFAULT TRUE	COMMENT '비밀글 여부',
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '생성 일시',
	`updated_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '수정 일시'
);

CREATE TABLE `refresh_tokens` (
	`refresh_token_id`	BIGINT	NOT NULL	COMMENT '시간 남으면 Redis로 변경',
	`user_id`	BIGINT	NOT NULL	COMMENT 'FK',
	`token_hash`	CHAR(64)	NOT NULL	COMMENT 'SHA-256',
	`expires_at`	DATETIME(6)	NOT NULL	COMMENT '만료일',
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '생성일',
	`updated_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '수정일'
);

CREATE TABLE `books` (
	`book_id`	BIGINT	NOT NULL	COMMENT '책id',
	`isbn`	VARCHAR(20)	NULL	COMMENT 'ISBN',
	`title`	VARCHAR(255)	NOT NULL	COMMENT '제목',
	`author`	VARCHAR(255)	NULL	COMMENT '저자',
	`publisher`	VARCHAR(255)	NULL	COMMENT '출판사',
	`pubdate`	VARCHAR(30)	NULL	COMMENT '출간일',
	`description`	TEXT	NULL	COMMENT '소개',
	`image`	VARCHAR(1000)	NULL	COMMENT '표지',
	`link`	VARCHAR(1000)	NULL	COMMENT '쇼핑링크',
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6),
	`updated_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)
);

CREATE TABLE `users` (
	`user_id`	BIGINT	NOT NULL,
	`login_id`	VARCHAR(20)	NULL	COMMENT 'Local 회원가입시 입력, 소셜 NULL',
	`password`	CHAR(60)	NULL	COMMENT 'BCryt 암호화되어 저장',
	`provider`	VARCHAR(20)	NOT NULL	COMMENT 'enum {LOCAL / GOOGLE / NAVER / KAKAO}',
	`nickname`	VARCHAR(20)	NOT NULL	COMMENT 'local : 회원가입시 입력, 소셜 : 임의 값 생성, 마이페이지에서 변경',
	`email`	VARCHAR(255)	NULL	COMMENT 'local 비밀번호 변경용, 소셜 NULL',
	`profile_image_url`	VARCHAR(1000)	NULL	COMMENT '추후 구현 예정',
	`role`	VARCHAR(20)	NOT NULL	DEFAULT 'USER'	COMMENT 'enum {USER / ADMIN}',
	`status`	VARCHAR(20)	NOT NULL	DEFAULT 'ACTIVE'	COMMENT 'enum {ACTIVE / SUSPENDED /  DELETED}',
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '생성일',
	`updated_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '수정일 (status = SUSPENDED or DELETED 이면 해당 일)'
);

CREATE TABLE `notices` (
	`notice_id`	BIGINT	NOT NULL	COMMENT '공지사항 ID',
	`user_id`	BIGINT	NOT NULL	COMMENT '작성 관리자(유저) ID',
	`category`	VARCHAR(30)	NOT NULL	COMMENT '공지 분류 (GENERAL, EVENT, UPDATE, MAINTENANCE 등)',
	`title`	VARCHAR(255)	NOT NULL	COMMENT '제목',
	`content`	MEDIUMTEXT	NOT NULL	COMMENT '내용',
	`is_pinned`	BOOLEAN	NOT NULL	DEFAULT FALSE	COMMENT '상단 고정 여부',
	`is_important`	BOOLEAN	NOT NULL	DEFAULT FALSE	COMMENT '중요 공지 여부',
	`view_count`	INT	NOT NULL	DEFAULT 0	COMMENT '조회수',
	`status`	VARCHAR(20)	NOT NULL	DEFAULT 'ACTIVE'	COMMENT '상태 (ACTIVE, DELETED)',
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '생성 일시',
	`updated_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '수정 일시'
);

CREATE TABLE `social_accounts` (
	`social_account_id`	BIGINT	NOT NULL,
	`user_id`	BIGINT	NOT NULL	COMMENT 'FK',
	`provider`	VARCHAR(20)	NOT NULL	COMMENT 'enum {GOOGLE / NAVER / KAKAO}. uniqe(provider , provider_user_id)',
	`provider_user_id`	VARCHAR(255)	NOT NULL	COMMENT 'OAuth id',
	`provider_email`	VARCHAR(255)	NULL	COMMENT 'OAuth email',
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '생성일',
	`updated_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)	COMMENT '수정일'
);

CREATE TABLE `bookmarks` (
	`bookmark_id`	BIGINT	NOT NULL	COMMENT '북마크id',
	`user_id`	BIGINT	NOT NULL	COMMENT '유저id',
	`book_id`	BIGINT	NOT NULL	COMMENT '책id',
	`created_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6),
	`updated_at`	DATETIME(6)	NOT NULL	DEFAULT CURRENT_TIMESTAMP(6)
);

-- ─────────────── PRIMARY KEY ───────────────

ALTER TABLE `inquiry_answers` ADD CONSTRAINT `PK_INQUIRY_ANSWERS` PRIMARY KEY (`inquiry_answer_id`);
ALTER TABLE `post_comments` ADD CONSTRAINT `PK_POST_COMMENTS` PRIMARY KEY (`comment_id`);
ALTER TABLE `posts` ADD CONSTRAINT `PK_POSTS` PRIMARY KEY (`post_id`);
ALTER TABLE `notifications` ADD CONSTRAINT `PK_NOTIFICATIONS` PRIMARY KEY (`notification_id`);
ALTER TABLE `library` ADD CONSTRAINT `PK_LIBRARY` PRIMARY KEY (`lib_id`);
ALTER TABLE `post_scraps` ADD CONSTRAINT `PK_POST_SCRAPS` PRIMARY KEY (`post_scrap_id`);
ALTER TABLE `post_comment_likes` ADD CONSTRAINT `PK_POST_COMMENT_LIKES` PRIMARY KEY (`comment_like_id`);
ALTER TABLE `reports` ADD CONSTRAINT `PK_REPORTS` PRIMARY KEY (`report_id`);
ALTER TABLE `admin_action_log` ADD CONSTRAINT `PK_ADMIN_ACTION_LOG` PRIMARY KEY (`admin_action_log_id`);
ALTER TABLE `post_images` ADD CONSTRAINT `PK_POST_IMAGES` PRIMARY KEY (`post_image_id`);
ALTER TABLE `post_likes` ADD CONSTRAINT `PK_POST_LIKES` PRIMARY KEY (`post_like_id`);
ALTER TABLE `inquiry_images` ADD CONSTRAINT `PK_INQUIRY_IMAGES` PRIMARY KEY (`inquiry_image_id`);
ALTER TABLE `book_reviews` ADD CONSTRAINT `PK_BOOK_REVIEWS` PRIMARY KEY (`review_id`);
ALTER TABLE `login_histories` ADD CONSTRAINT `PK_LOGIN_HISTORIES` PRIMARY KEY (`login_history_id`);
ALTER TABLE `inquiries` ADD CONSTRAINT `PK_INQUIRIES` PRIMARY KEY (`inquiry_id`);
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `PK_REFRESH_TOKENS` PRIMARY KEY (`refresh_token_id`);
ALTER TABLE `books` ADD CONSTRAINT `PK_BOOKS` PRIMARY KEY (`book_id`);
ALTER TABLE `users` ADD CONSTRAINT `PK_USERS` PRIMARY KEY (`user_id`);
ALTER TABLE `notices` ADD CONSTRAINT `PK_NOTICES` PRIMARY KEY (`notice_id`);
ALTER TABLE `social_accounts` ADD CONSTRAINT `PK_SOCIAL_ACCOUNTS` PRIMARY KEY (`social_account_id`);
ALTER TABLE `bookmarks` ADD CONSTRAINT `PK_BOOKMARKS` PRIMARY KEY (`bookmark_id`);

-- ─────────────── AUTO_INCREMENT ───────────────

ALTER TABLE `inquiry_answers` MODIFY `inquiry_answer_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `post_comments` MODIFY `comment_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `posts` MODIFY `post_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `notifications` MODIFY `notification_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `library` MODIFY `lib_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `post_scraps` MODIFY `post_scrap_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `post_comment_likes` MODIFY `comment_like_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `reports` MODIFY `report_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `admin_action_log` MODIFY `admin_action_log_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `post_images` MODIFY `post_image_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `post_likes` MODIFY `post_like_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `inquiry_images` MODIFY `inquiry_image_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `book_reviews` MODIFY `review_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `login_histories` MODIFY `login_history_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `inquiries` MODIFY `inquiry_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `refresh_tokens` MODIFY `refresh_token_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `books` MODIFY `book_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `users` MODIFY `user_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `notices` MODIFY `notice_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `social_accounts` MODIFY `social_account_id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `bookmarks` MODIFY `bookmark_id` BIGINT NOT NULL AUTO_INCREMENT;

-- ─────────────── UNIQUE / INDEX ───────────────

-- (books / book_reviews / bookmarks)
ALTER TABLE `books` ADD CONSTRAINT `UK_BOOKS_ISBN` UNIQUE (`isbn`);
ALTER TABLE `book_reviews` ADD INDEX `IDX_BOOK_REVIEWS_BOOK` (`book_id`);
ALTER TABLE `bookmarks` ADD CONSTRAINT `UK_BOOKMARKS_USER_BOOK` UNIQUE (`user_id`, `book_id`);

-- 공용(코멘트로만 있던 유니크 → 실제 제약으로)
ALTER TABLE `post_scraps` ADD CONSTRAINT `UK_POST_SCRAPS_POST_USER` UNIQUE (`post_id`, `user_id`);
ALTER TABLE `post_comment_likes` ADD CONSTRAINT `UK_POST_COMMENT_LIKES_COMMENT_USER` UNIQUE (`comment_id`, `user_id`);
ALTER TABLE `post_likes` ADD CONSTRAINT `UK_POST_LIKES_POST_USER` UNIQUE (`post_id`, `user_id`);
ALTER TABLE `post_images` ADD CONSTRAINT `UK_POST_IMAGES_IMAGE_KEY` UNIQUE (`image_key`);
ALTER TABLE `social_accounts` ADD CONSTRAINT `UK_SOCIAL_ACCOUNTS_PROVIDER_USER` UNIQUE (`provider`, `provider_user_id`);