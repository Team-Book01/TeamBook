package com.teambook.panorama.domain.inquiry.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.teambook.panorama.domain.admin.service.InquiryService;
import com.teambook.panorama.domain.inquiry.dto.InquirySubmitRequestDto;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 문의하기 팝업의 제출 API. 얇은 사용자용 컨트롤러가 admin.service 를 호출하는 구조는
 * ReportSubmitController(도메인 report)와 동일하다 — 신고·문의 모두 "제출은 사용자,
 * 처리·조회는 관리자"라 서비스 구현은 admin 쪽에 있다.
 *
 * <p>본문(JSON)과 이미지(파일)를 한 멀티파트 요청으로 함께 받는다. "request" 파트는
 * JSON Blob 으로 실어 보내면 Spring 이 {@link InquirySubmitRequestDto} 로 역직렬화하고
 * {@code @Valid} 를 그대로 적용한다.</p>
 */
@RestController
@RequestMapping("/api/v1/inquiries")
@RequiredArgsConstructor
public class InquirySubmitController {

  private final InquiryService inquiryService;

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<Void> submit(
      @AuthenticationPrincipal Long userId,
      @Valid @RequestPart("request") InquirySubmitRequestDto request,
      @RequestPart(value = "images", required = false) List<MultipartFile> images) {
    Long inquiryId = inquiryService.createInquiry(
        userId, request.category(), request.title(), request.content(), images);
    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{id}").buildAndExpand(inquiryId).toUri();
    return ResponseEntity.created(location).build();
  }
}
