package com.teambook.panorama.domain.book.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.book.entity.Bookmark;
import java.util.List;


public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
  
  Optional<Bookmark> findByUserIdAndBook_BookId(Long userId, Long bookId);
  long countByBook_BookId(Long bookId);

  long countByUserId(Long userId);

  List<Bookmark> findByUserId(Long userId);

}
