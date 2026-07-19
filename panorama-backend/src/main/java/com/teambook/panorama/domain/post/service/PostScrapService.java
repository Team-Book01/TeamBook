package com.teambook.panorama.domain.post.service;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import com.teambook.panorama.domain.post.dto.PostScrapResponseDto;
import com.teambook.panorama.domain.post.dto.PostSummaryResponseDto;

public interface PostScrapService {

  PostScrapResponseDto scrap(Long postId, Long userId);

  PostScrapResponseDto unscrap(Long postId, Long userId);

  Slice<PostSummaryResponseDto> findMyScraps(Long userId, Pageable pageable);
}
