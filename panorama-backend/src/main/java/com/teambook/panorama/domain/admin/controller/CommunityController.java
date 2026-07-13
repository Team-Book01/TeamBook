package com.teambook.panorama.domain.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.admin.dto.community.CommunityContentDetailResponse;
import com.teambook.panorama.domain.admin.dto.community.CommunityContentResponse;
import com.teambook.panorama.domain.admin.dto.community.CommunityContentSearchRequest;
import com.teambook.panorama.domain.admin.dto.community.CommunityProcessRequest;
import com.teambook.panorama.domain.admin.service.CommunityService;
import com.teambook.panorama.global.response.PageResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "관리자 - 커뮤니티 관리", description = "게시글/댓글/리뷰 콘텐츠 목록·상세 조회 및 숨김·삭제 처리 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/communities")
public class CommunityController {

  private final CommunityService communityService;

  // 커뮤니티
  /** 커뮤니티 - 관리 목록(+검색). contentType(POST/COMMENT/REVIEW) 하나를 골라 조회. body 생략 시 기본(POST). */
  @Operation(summary = "커뮤니티 콘텐츠 목록 조회(+검색)",
      description = "contentType(POST/COMMENT/REVIEW) 하나를 골라 콘텐츠 목록을 페이지 단위로 조회한다. body 를 생략하면 기본값(POST)으로 처리한다.")
  @PostMapping
  public ResponseEntity<PageResponse<CommunityContentResponse>> getContents(
      @RequestBody(required = false) CommunityContentSearchRequest request) {
    if (request == null) {
      request = CommunityContentSearchRequest.ofDefaults();
    }
    return ResponseEntity.ok(communityService.getContents(request));
  }

  /** 커뮤니티 - 상세 (원본 이동용 parentPostId/bookId/category 포함) */
  @Operation(summary = "커뮤니티 콘텐츠 상세 조회",
      description = "콘텐츠 단건의 상세 정보를 조회한다. 원본 이동에 필요한 parentPostId/bookId/category 를 포함한다.")
  @GetMapping("/{contentType}/{contentId}")
  public ResponseEntity<CommunityContentDetailResponse> getContentDetail(
      @PathVariable("contentType") String contentType, @PathVariable("contentId") Long contentId) {
    return ResponseEntity.ok(communityService.getContentDetail(contentType, contentId));
  }

  /** 커뮤니티 - 처리 (숨김/삭제) */
  @Operation(summary = "커뮤니티 콘텐츠 처리",
      description = "콘텐츠를 숨김 또는 삭제 처리한다.")
  @PatchMapping("/{contentType}/{contentId}/process")
  public ResponseEntity<Void> processContent(
      @PathVariable("contentType") String contentType,
      @PathVariable("contentId") Long contentId,
      @RequestBody @Valid CommunityProcessRequest request) {
    communityService.processContent(contentType, contentId, request);
    return ResponseEntity.ok().build();
  }

}
