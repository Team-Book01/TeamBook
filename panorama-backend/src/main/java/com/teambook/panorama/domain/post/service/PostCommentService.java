package com.teambook.panorama.domain.post.service;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import com.teambook.panorama.domain.post.dto.PostCommentListResponseDto;
import com.teambook.panorama.domain.post.dto.PostCommentRequestDto;
import com.teambook.panorama.domain.post.dto.PostCommentResponseDto;
import com.teambook.panorama.domain.post.dto.PostCommentUpdateRequestDto;

public interface PostCommentService {

  Long createComment(Long userId, Long postId, PostCommentRequestDto request);

  Slice<PostCommentListResponseDto> findComments(Long postId, Pageable pageable);

  PostCommentResponseDto updateComment(Long postId, Long commentId, Long userId,
      PostCommentUpdateRequestDto request);

  void deleteComment(Long postId, Long commentId, Long userId);
}
