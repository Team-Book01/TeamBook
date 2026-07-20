package com.teambook.panorama.domain.admin.controller;

import java.util.List;

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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.teambook.panorama.domain.admin.dto.notice.NoticeCreateRequest;
import com.teambook.panorama.domain.admin.dto.notice.NoticeDetailResponse;
import com.teambook.panorama.domain.admin.dto.notice.NoticeImageResponse;
import com.teambook.panorama.domain.admin.dto.notice.NoticeResponse;
import com.teambook.panorama.domain.admin.dto.notice.NoticeSearchRequest;
import com.teambook.panorama.domain.admin.dto.notice.NoticeUpdateRequest;
import com.teambook.panorama.domain.admin.service.NoticeImageService;
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
  private final NoticeImageService noticeImageService;

  /**
   * 공지 본문 이미지 업로드. 에디터가 공지 저장 전에 호출하므로 아직 소유자가 없는 이미지로 들어간다.
   *
   * <p>게시글의 /posts/images 와 달리 이 경로는 /api/v1/admin/** 아래에 있어
   * SecurityConfig 의 hasRole("ADMIN") 이 그대로 적용된다. 인가를 따로 코딩하지 않기 위해
   * 범용 업로드로 합치지 않고 도메인별로 나눠 둔다.</p>
   */
  @Operation(summary = "공지 이미지 업로드", description = "공지 본문에 삽입할 이미지를 업로드하고 URL 을 반환한다.")
  @PostMapping("/images")
  public ResponseEntity<List<NoticeImageResponse>> uploadImages(
      @RequestPart("images") List<MultipartFile> files) {
    return ResponseEntity.status(HttpStatus.CREATED).body(noticeImageService.uploadImages(files));
  }

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
