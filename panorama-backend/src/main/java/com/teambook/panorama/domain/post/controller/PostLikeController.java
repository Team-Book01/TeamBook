package com.teambook.panorama.domain.post.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.post.dto.PostLikeResponseDto;
import com.teambook.panorama.domain.post.service.PostLikeService;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/posts/{postId}/like")
public class PostLikeController {

  private final PostLikeService postLikeService;

  @Operation(summary = "게시글 추천")
  @PostMapping
  public ResponseEntity<PostLikeResponseDto> like(
      @PathVariable Long postId,
      @AuthenticationPrincipal Long userId) {
    return ResponseEntity.ok(postLikeService.like(postId, userId));
  }

  @Operation(summary = "게시글 추천 취소")
  @DeleteMapping
  public ResponseEntity<PostLikeResponseDto> unlike(
      @PathVariable Long postId,
      @AuthenticationPrincipal Long userId) {
    return ResponseEntity.ok(postLikeService.unlike(postId, userId));
  }
}
