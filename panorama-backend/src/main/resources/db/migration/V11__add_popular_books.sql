CREATE TABLE `popular_books` (
	`popular_id` BIGINT NOT NULL COMMENT 'id',
	`rank`	INT	NOT NULL	COMMENT '인기순위',
	`isbn`	VARCHAR(20)	NOT NULL	COMMENT 'ISBN',
	`loan_count` VARCHAR(20) NOT	NULL	COMMENT '대출수'
);