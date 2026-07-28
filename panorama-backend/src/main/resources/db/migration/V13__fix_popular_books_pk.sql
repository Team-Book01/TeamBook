-- popular_id 에 PRIMARY KEY / AUTO_INCREMENT 가 없어 INSERT 시
-- "Field 'popular_id' doesn't have a default value" 로 실패하던 것을 바로잡는다.
-- 엔티티는 @GeneratedValue(IDENTITY) 로 DB 자동생성을 기대한다.
ALTER TABLE popular_books
  MODIFY COLUMN popular_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY;
