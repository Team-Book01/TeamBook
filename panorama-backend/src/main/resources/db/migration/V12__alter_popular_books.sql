ALTER TABLE popular_books DROP COLUMN isbn;
ALTER TABLE popular_books ADD COLUMN book_id BIGINT NOT NULL;
ALTER TABLE popular_books ADD FOREIGN KEY (book_id) REFERENCES books(book_id);