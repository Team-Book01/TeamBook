package com.teambook.panorama.domain.book.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.book.entity.Book;

public interface BookRepository extends JpaRepository<Book, Long> {

}
