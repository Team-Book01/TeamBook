package com.teambook.panorama.domain.admin.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.admin.dto.notice.NoticeCreateRequest;
import com.teambook.panorama.domain.admin.dto.notice.NoticeDetailResponse;
import com.teambook.panorama.domain.admin.dto.notice.NoticeResponse;
import com.teambook.panorama.domain.admin.dto.notice.NoticeSearchRequest;
import com.teambook.panorama.domain.admin.dto.notice.NoticeUpdateRequest;
import com.teambook.panorama.domain.admin.service.NoticeService;
import com.teambook.panorama.global.response.PageResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Tag(name = "관리자 - 공지사항 관리", description = "공지사항 작성, 목록/상세 조회 및 수정 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/notices")
@Slf4j
public class NoticeController {

  private final NoticeService noticeService;

  @Operation(summary = "공지 작성", description = "새 공지사항을 등록하고 생성된 공지를 반환한다.")
  @PostMapping
  public ResponseEntity<NoticeResponse> createNotice(@RequestBody NoticeCreateRequest request) {
    NoticeResponse response = noticeService.saveNotice(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  // 공지 - 목록 (GET + 쿼리파라미터. 파라미터 없으면 compact 생성자가 page/size 기본값 보정)
  @Operation(summary = "공지 목록 조회(+검색)", description = "검색 조건(쿼리 파라미터)에 맞는 공지 목록을 페이지 단위로 조회한다. 파라미터를 생략하면 page/size 기본값이 적용된다.")
  @GetMapping
  public ResponseEntity<PageResponse<NoticeResponse>> getNotices(
      @ModelAttribute NoticeSearchRequest request) {
    PageResponse<NoticeResponse> response = noticeService.getNotices(request);
    return ResponseEntity.ok(response);
  }

  // 공지 - 상세
  @Operation(summary = "공지 상세 조회", description = "공지사항 단건의 상세 정보를 조회한다.")
  @GetMapping("/{noticeId}")
  public ResponseEntity<NoticeDetailResponse> getNoticeDetail(@PathVariable("noticeId") Long noticeId) {
    NoticeDetailResponse response = noticeService.getNoticeDetail(noticeId);
    return ResponseEntity.ok(response);
  }

  // 공지 - 수정(핀/중요 포함)
  @Operation(summary = "공지 수정 (핀/중요 포함)", description = "공지사항 내용과 핀/중요 여부를 수정하고 수정된 상세 정보를 반환한다.")
  @PutMapping("/{noticeId}")
  public ResponseEntity<NoticeDetailResponse> updateNotice(
      @PathVariable("noticeId") Long noticeId,
      @RequestBody NoticeUpdateRequest request) {
    NoticeDetailResponse response = noticeService.updateNotice(noticeId, request);
    return ResponseEntity.ok(response);
  }

  // 공지 - 처리 변경(단일/다중)

  // 공지 - 삭제

}
