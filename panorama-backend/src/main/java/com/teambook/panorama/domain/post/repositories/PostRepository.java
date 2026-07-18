package com.teambook.panorama.domain.post.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teambook.panorama.domain.post.entity.Post;
import com.teambook.panorama.domain.post.enums.PostStatus;

public interface PostRepository extends JpaRepository<Post, Long> {
  @EntityGraph(attributePaths = { "book", "user" })
  Slice<Post> findByStatusOrderByCreatedAtDesc(PostStatus status, Pageable pageable);

  @EntityGraph(attributePaths = { "book", "user" })
  @Query("SELECT p FROM Post p " +
      "WHERE p.status = :status " +
      "AND (SELECT COUNT(pl) FROM PostLike pl WHERE pl.post = p) >= :n " +
      "ORDER BY p.createdAt DESC")
  Slice<Post> findPopular(@Param("status") PostStatus status, @Param("n") long n, Pageable pageable);
}
