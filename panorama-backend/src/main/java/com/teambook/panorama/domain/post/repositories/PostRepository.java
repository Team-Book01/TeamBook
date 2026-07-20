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

  // [리뷰 반영] likeCount를 SELECT/WHERE에서 행마다 각각 계산하던 상관 서브쿼리를
  // LEFT JOIN + GROUP BY + HAVING으로 전환 — 집계는 COUNT(pl) 한 번으로 통일.
  // commentCount는 PostLike와 이중 조인 시 행 곱셈(카티전) 오염이 생기므로 스칼라 서브쿼리 유지(행당 1회).
  // GROUP BY는 세 테이블의 PK(p.postId, u.id, b.bookId) — 나머지 선택 컬럼은 PK에 함수 종속(MySQL ONLY_FULL_GROUP_BY 허용).
  // [리뷰 반영] p.content 전문 대신 SUBSTRING(...) 절단 — 101인 이유: DTO 컴팩트 생성자가
  // "length > 100이면 97자+…"로 자르므로, 101자를 넘겨야 긴 글에서 말줄임 동작이 기존과 동일하게 유지된다.
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

  // [리뷰 반영] p.content 전문 대신 SUBSTRING 절단(101 — 위와 동일한 이유)
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
