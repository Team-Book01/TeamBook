-- `rank` 는 MySQL 예약어라 JPA 쿼리/DDL 에서 문제가 되어 ranking 으로 변경한다.
ALTER TABLE popular_books
  CHANGE COLUMN `rank` ranking INT NOT NULL COMMENT '인기순위';
