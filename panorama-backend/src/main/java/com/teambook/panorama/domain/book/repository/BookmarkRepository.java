package com.teambook.panorama.domain.book.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teambook.panorama.domain.book.entity.Bookmark;
import java.util.List;


public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
  
  Optional<Bookmark> findByUserIdAndBook_BookId(Long userId, Long bookId);
  long countByBook_BookId(Long bookId);

  long countByUserId(Long userId);

  List<Bookmark> findByUserId(Long userId);

  //북마크 리스트에서 book을 사용하기 위한 join fetch
  @Query("SELECT b FROM Bookmark b JOIN FETCH b.book WHERE b.userId = :userId")
  List<Bookmark> findByUserIdWithBook(@Param("userId") Long userId);
}
