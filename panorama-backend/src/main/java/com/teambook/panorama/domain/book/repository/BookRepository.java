package com.teambook.panorama.domain.book.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.book.entity.Book;

public interface BookRepository extends JpaRepository<Book, Long> {
  //책 단건 조회
  Optional<Book> findByIsbn(String isbn);

}
