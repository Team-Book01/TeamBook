package com.teambook.panorama.domain.book.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.book.entity.BookReview;
import java.util.List;


public interface ReviewRepository extends JpaRepository<BookReview, Long> {
  
  boolean existsByUserIdAndBook_BookId(Long userId, Long bookId);

  long countByUserId(Long userId);

  List<BookReview> findByUserId(Long userId);

  
}
