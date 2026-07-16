package com.teambook.panorama.domain.post.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.post.dto.PostScrapResponseDto;
import com.teambook.panorama.domain.post.service.PostScrapService;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/posts/{postId}/scrap")
public class PostScrapController {

  private final PostScrapService postScrapService;

  @Operation(summary = "게시글 스크랩")
  @PostMapping
  public ResponseEntity<PostScrapResponseDto> scrap(
      @PathVariable Long postId,
      @RequestHeader("X-USER-ID") Long userId) {   // TODO: @AuthenticationPrincipal 교체 (7/17)
    return ResponseEntity.ok(postScrapService.scrap(postId, userId));
  }

  @Operation(summary = "게시글 스크랩 취소")
  @DeleteMapping
  public ResponseEntity<PostScrapResponseDto> unscrap(
      @PathVariable Long postId,
      @RequestHeader("X-USER-ID") Long userId) {   // TODO: @AuthenticationPrincipal 교체 (7/17)
    return ResponseEntity.ok(postScrapService.unscrap(postId, userId));
  }
}
