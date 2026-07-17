package com.teambook.panorama.domain.post.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.post.dto.PostSummaryResponseDto;
import com.teambook.panorama.domain.post.service.PostScrapService;
import com.teambook.panorama.global.response.SliceResponse;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/members/me")
public class MyPageController {
  private final PostScrapService postScrapService;

  @Operation(summary = "내 스크랩 목록")
  @GetMapping("/scraps")
  public ResponseEntity<SliceResponse<PostSummaryResponseDto>> myScraps(
      @AuthenticationPrincipal Long userId,
      @PageableDefault(size = 10) Pageable pageable) {
    return ResponseEntity.ok(SliceResponse.of(postScrapService.findMyScraps(userId, pageable)));
  }
}
