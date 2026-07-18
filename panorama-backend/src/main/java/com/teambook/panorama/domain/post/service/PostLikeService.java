package com.teambook.panorama.domain.post.service;

import com.teambook.panorama.domain.post.dto.PostLikeResponseDto;

public interface PostLikeService {

  PostLikeResponseDto like(Long postId, Long userId);

  PostLikeResponseDto unlike(Long postId, Long userId);
}
