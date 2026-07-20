package com.teambook.panorama.domain.post.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teambook.panorama.domain.post.dto.PostSummaryResponseDto;
import com.teambook.panorama.domain.post.entity.Post;
import com.teambook.panorama.domain.post.enums.PostCategory;
import com.teambook.panorama.domain.post.enums.PostStatus;

public interface PostRepository extends JpaRepository<Post, Long> {
  @EntityGraph(attributePaths = { "book", "user" })
  Slice<Post> findByStatusOrderByCreatedAtDesc(PostStatus status, Pageable pageable);

  @EntityGraph(attributePaths = { "book", "user" })
  Slice<Post> findByUser_IdAndStatusOrderByCreatedAtDesc(Long userId, PostStatus status, Pageable pageable);

  long countByUser_IdAndStatus(Long userId, PostStatus status);

  @Query("SELECT new com.teambook.panorama.domain.post.dto.PostSummaryResponseDto(" +
    "p.postId, b.bookId, u.nickname, p.category, p.title, SUBSTRING(p.content, 1, 101), " +
    "p.viewCount, p.createdAt, b.title, b.author, " +
    "COUNT(pl), " +
    "(SELECT COUNT(c) FROM PostComment c WHERE c.post = p AND c.status = com.teambook.panorama.domain.post.enums.CommentStatus.ACTIVE)) " +
    "FROM Post p JOIN p.user u LEFT JOIN p.book b LEFT JOIN PostLike pl ON pl.post = p " +
      "WHERE p.status = :status " +
      "GROUP BY p.postId, u.id, b.bookId " +
      "HAVING COUNT(pl) >= :n " +
      "ORDER BY p.createdAt DESC")
  Slice<PostSummaryResponseDto> findPopular(@Param("status") PostStatus status, @Param("n") long n, Pageable pageable);

  @Query("SELECT new com.teambook.panorama.domain.post.dto.PostSummaryResponseDto(" +
    "p.postId, b.bookId, u.nickname, p.category, p.title, SUBSTRING(p.content, 1, 101), " +
    "p.viewCount, p.createdAt, b.title, b.author, " +
    "(SELECT COUNT(pl) FROM PostLike pl WHERE pl.post = p), " +
    "(SELECT COUNT(c) FROM PostComment c WHERE c.post = p AND c.status = com.teambook.panorama.domain.post.enums.CommentStatus.ACTIVE)) " +
    "FROM Post p JOIN p.user u LEFT JOIN p.book b " +
    "WHERE p.status = :status " +
    "AND (:category IS NULL OR p.category = :category) " +
    "AND (:isbn IS NULL OR b.isbn = :isbn) " +
    "ORDER BY p.createdAt DESC")
  Slice<PostSummaryResponseDto> findActiveSummaries(@Param("status") PostStatus status, @Param("category") PostCategory category, @Param("isbn") String isbn, Pageable pageable);
}
