package com.teambook.panorama.domain.post.repositories;

import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.post.entity.PostScrap;
import com.teambook.panorama.domain.post.enums.PostStatus;
import com.teambook.panorama.domain.post.entity.Post;

public interface PostScrapRepository extends JpaRepository<PostScrap, Long> {
  boolean existsByPostAndUserId(Post post, Long userId);

  Optional<PostScrap> findByPostAndUserId(Post post, Long userId);

  @EntityGraph(attributePaths = { "post", "post.user", "post.book" })
  Slice<PostScrap> findByUserIdAndPost_StatusOrderByCreatedAtDesc(Long userId, PostStatus status, Pageable pageable);

  // 마이페이지 카운트 박스 — 위 목록(findMyScraps)과 동일 기준(원글 ACTIVE): 박스 숫자와 목록 건수가 일치해야 한다.
  long countByUserIdAndPost_Status(Long userId, PostStatus status);
}
