package com.teambook.panorama.domain.book.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.book.entity.BookReview;
import com.teambook.panorama.domain.book.entity.ReviewStatus;

import java.util.List;


public interface ReviewRepository extends JpaRepository<BookReview, Long> {
  
  boolean existsByUserIdAndBook_BookIdAndStatus(Long userId, Long bookId, ReviewStatus status);

  long countByUserIdAndStatus(Long userId, ReviewStatus status);

  List<BookReview> findByUserIdAndStatus(Long userId, ReviewStatus status);

  
}
