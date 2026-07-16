package com.teambook.panorama.domain.post.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.post.entity.PostScrap;
import com.teambook.panorama.domain.post.entity.Post;

public interface PostScrapRepository extends JpaRepository<PostScrap, Long> {
  boolean existsByPostAndUserId(Post post, Long userId);
  Optional<PostScrap> findByPostAndUserId(Post post, Long userId);
}
