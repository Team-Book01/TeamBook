package com.teambook.panorama.domain.book.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teambook.panorama.domain.book.entity.BookReview;
import com.teambook.panorama.domain.book.entity.ReviewStatus;

import java.util.List;
import java.util.Optional;


public interface ReviewRepository extends JpaRepository<BookReview, Long> {
  
  boolean existsByUserIdAndBook_BookIdAndStatus(Long userId, Long bookId, ReviewStatus status);

  long countByUserIdAndStatus(Long userId, ReviewStatus status);

  List<BookReview> findByUserIdAndStatus(Long userId, ReviewStatus status);

  //북마크 리스트에서 book을 사용하기 위한 join fetch
  @Query("SELECT r FROM BookReview r JOIN FETCH r.book WHERE r.userId = :userId AND r.status = :status")
  List<BookReview> findByUserIdAndStatusWithBook(@Param("userId") Long userId, @Param("status") ReviewStatus status);

  @Query("SELECT r FROM BookReview r JOIN FETCH r.book b WHERE r.userId = :userId AND r.status = :status AND b.bookId = :bookId")
  Optional<BookReview> findByBook_BookIdAndUserIdAndStatus(
        @Param("bookId") Long bookId,
        @Param("userId") Long userId,
        @Param("status") ReviewStatus status);
}
