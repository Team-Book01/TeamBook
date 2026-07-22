package com.teambook.panorama.domain.post.service;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import com.teambook.panorama.domain.post.dto.MyPageStatsResponseDto;
import com.teambook.panorama.domain.post.dto.PostDetailResponseDto;
import com.teambook.panorama.domain.post.dto.PostRequestDto;
import com.teambook.panorama.domain.post.dto.PostResponseDto;
import com.teambook.panorama.domain.post.dto.PostSummaryResponseDto;
import com.teambook.panorama.domain.post.enums.PostCategory;

public interface PostService {

  Long createPost(Long userId, PostRequestDto request);

  PostDetailResponseDto getDetailAndIncreaseView(Long postId, Long userId);

  Slice<PostSummaryResponseDto> findActivePosts(PostCategory category, String isbn, Pageable pageable);

  /** 특정 책(isbn)으로 작성된 ACTIVE 게시글 수 (도서 상세 "게시글 수" 용, DB 조회). */
  long countActivePostsByIsbn(String isbn);

  PostResponseDto updatePost(Long postId, Long userId, PostRequestDto request);

  void deletePost(Long postId, Long userId);

  Slice<PostSummaryResponseDto> findPopularPosts(Pageable pageable);

  Slice<PostSummaryResponseDto> findMyPosts(Long userId, Pageable pageable);

  MyPageStatsResponseDto findMyStats(Long userId);
}
