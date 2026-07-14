package com.teambook.panorama.domain.post.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.post.entity.Post;
import com.teambook.panorama.domain.post.enums.PostStatus;

public interface PostRepository extends JpaRepository<Post, Long> {
  @EntityGraph(attributePaths = {"book", "user"})
  Slice<Post> findByStatusOrderByCreatedAtDesc(PostStatus status, Pageable pageable);
}
