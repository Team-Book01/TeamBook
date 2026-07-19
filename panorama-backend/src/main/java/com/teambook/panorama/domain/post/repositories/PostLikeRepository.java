package com.teambook.panorama.domain.post.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.post.entity.Post;
import com.teambook.panorama.domain.post.entity.PostLike;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
  boolean existsByPostAndUserId(Post post, Long userId);

  Optional<PostLike> findByPostAndUserId(Post post, Long userId);
  
  long countByPost(Post post);
}
