package com.teambook.panorama.domain.book.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.book.entity.BookReview;

public interface ReviewRepository extends JpaRepository<BookReview, Long> {
  public boolean existsByUserIdAndBook_BookId(Long userId, Long bookId);
  
}
