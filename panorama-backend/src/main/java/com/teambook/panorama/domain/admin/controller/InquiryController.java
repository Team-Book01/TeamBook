package com.teambook.panorama.domain.admin.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.admin.dto.inquiry.InquiryAnswerCreateRequest;
import com.teambook.panorama.domain.admin.dto.inquiry.InquiryDetailResponse;
import com.teambook.panorama.domain.admin.dto.inquiry.InquiryResponse;
import com.teambook.panorama.domain.admin.dto.inquiry.InquirySearchRequest;
import com.teambook.panorama.domain.admin.dto.inquiry.InquiryStatusUpdateRequest;
import com.teambook.panorama.domain.admin.service.InquiryService;
import com.teambook.panorama.global.response.PageResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "관리자 - 문의 관리", description = "1:1 문의 목록/상세 조회, 답변 등록 및 상태 변경 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/inquiries")
public class InquiryController {

  private final InquiryService inquiryService;

  // 문의
  /**
   * 문의 - 목록(+검색). body 생략 시 기본 검색.
   * 
   * @param request
   * @return
   */
  @Operation(summary = "문의 목록 조회(+검색)",
      description = "검색 조건에 맞는 문의 목록을 페이지 단위로 조회한다. body 를 생략하면 기본 검색으로 처리한다.")
  @PostMapping
  public ResponseEntity<PageResponse<InquiryResponse>> getInquiries(
      @RequestBody(required = false) InquirySearchRequest request) {
    if (request == null) {
      request = InquirySearchRequest.ofDefaults();
    }
    PageResponse<InquiryResponse> inquiries = inquiryService.getInquiries(request);
    return ResponseEntity.ok(inquiries);
  }

  /** 문의 - 상세 (이미지 + 답변 목록) */
  @Operation(summary = "문의 상세 조회",
      description = "문의 단건의 상세 정보를 첨부 이미지 및 답변 목록과 함께 조회한다.")
  @GetMapping("/{inquiryId}")
  public ResponseEntity<InquiryDetailResponse> getInquiryDetail(@PathVariable("inquiryId") Long inquiryId) {
    return ResponseEntity.ok(inquiryService.getInquiryDetail(inquiryId));
  }

  /** 문의 - 처리(답변 등록). 등록 시 문의는 ANSWERED 로 전환. → 201 + 답변 id */
  @Operation(summary = "문의 답변 등록",
      description = "문의에 답변을 등록하고 생성된 답변 ID 를 반환한다. 등록 시 문의 상태는 ANSWERED 로 전환된다.")
  @PostMapping("/{inquiryId}/answers")
  public ResponseEntity<Long> answerInquiry(
      @PathVariable("inquiryId") Long inquiryId,
      @RequestBody @Valid InquiryAnswerCreateRequest request) {
    Long answerId = inquiryService.answerInquiry(inquiryId, request);
    return ResponseEntity.status(HttpStatus.CREATED).body(answerId);
  }

  /** 문의 - 상태 변경 (CLOSED 종료 등) */
  @Operation(summary = "문의 상태 변경",
      description = "문의 상태를 변경한다. (예: CLOSED 로 종료 처리)")
  @PatchMapping("/{inquiryId}/status")
  public ResponseEntity<Void> changeInquiryStatus(
      @PathVariable("inquiryId") Long inquiryId,
      @RequestBody @Valid InquiryStatusUpdateRequest request) {
    inquiryService.changeInquiryStatus(inquiryId, request.status());
    return ResponseEntity.ok().build();
  }

}
