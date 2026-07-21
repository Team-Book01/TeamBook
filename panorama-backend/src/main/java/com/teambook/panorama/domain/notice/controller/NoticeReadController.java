package com.teambook.panorama.domain.notice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.admin.dto.notice.NoticePublicSearchRequest;
import com.teambook.panorama.domain.admin.dto.notice.PublicNoticeDetailResponse;
import com.teambook.panorama.domain.admin.dto.notice.PublicNoticeResponse;
import com.teambook.panorama.domain.admin.service.NoticeService;
import com.teambook.panorama.global.response.PageResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 공지사항 공개(비로그인 포함) 조회 API. 얇은 사용자용 컨트롤러가 admin.service 를 호출하는
 * 구조는 report/inquiry 도메인과 동일 — 실제 조회 로직(및 상세의 조회수 증가)은 admin 쪽
 * NoticeService 에 있고, 여기서는 항상 ACTIVE 만 노출되도록 그 메서드만 호출한다.
 *
 * <p>SecurityConfig 에 GET 전용 permitAll 규칙이 별도로 있어야 로그인 없이도 접근된다
 * (/api/v1/admin/** 과 달리 이 경로는 그 규칙의 영향을 받지 않는다).</p>
 */
@Tag(name = "공지사항 (공개)", description = "로그인 여부와 무관하게 조회 가능한 공지사항 목록/상세")
@RestController
@RequestMapping("/api/v1/notices")
@RequiredArgsConstructor
public class NoticeReadController {

  private final NoticeService noticeService;

  @Operation(summary = "공지 목록 조회", description = "게시 중(ACTIVE)인 공지만 상단 고정 → 중요 → 최신순으로 조회한다.")
  @GetMapping
  public ResponseEntity<PageResponse<PublicNoticeResponse>> getNotices(
      @ModelAttribute NoticePublicSearchRequest request) {
    return ResponseEntity.ok(noticeService.getPublicNotices(request));
  }

  @Operation(summary = "공지 상세 조회", description = "조회할 때마다 조회수가 1 증가한다. 게시 중이 아닌 공지는 404.")
  @GetMapping("/{noticeId}")
  public ResponseEntity<PublicNoticeDetailResponse> getNotice(@PathVariable("noticeId") Long noticeId) {
    return ResponseEntity.ok(noticeService.getPublicNoticeDetail(noticeId));
  }
}
