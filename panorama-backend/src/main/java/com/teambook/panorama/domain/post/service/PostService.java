package com.teambook.panorama.domain.post.service;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import com.teambook.panorama.domain.post.dto.PostDetailResponseDto;
import com.teambook.panorama.domain.post.dto.PostRequestDto;
import com.teambook.panorama.domain.post.dto.PostResponseDto;
import com.teambook.panorama.domain.post.dto.PostSummaryResponseDto;
import com.teambook.panorama.domain.post.enums.PostCategory;

public interface PostService {

  Long createPost(Long userId, PostRequestDto request);

  PostDetailResponseDto getDetailAndIncreaseView(Long postId, Long userId);

  Slice<PostSummaryResponseDto> findActivePosts(PostCategory category, String isbn, Pageable pageable);

  PostResponseDto updatePost(Long postId, Long userId, PostRequestDto request);

  void deletePost(Long postId, Long userId);

  Slice<PostSummaryResponseDto> findPopularPosts(Pageable pageable);
}
