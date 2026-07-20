package com.teambook.panorama.domain.admin.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.teambook.panorama.domain.admin.dto.inquiry.InquiryAnswerCreateRequest;
import com.teambook.panorama.domain.admin.dto.inquiry.InquiryDetailResponse;
import com.teambook.panorama.domain.admin.dto.inquiry.InquiryResponse;
import com.teambook.panorama.domain.admin.dto.inquiry.InquirySearchRequest;
import com.teambook.panorama.domain.admin.entity.type.InquiryStatus;
import com.teambook.panorama.global.response.PageResponse;

public interface InquiryService {

  // 문의 - 등록(+첨부 이미지). 사용자 문의하기 팝업에서 호출 → 생성된 문의 id
  // 요청 DTO(domain.inquiry)를 그대로 받지 않고 필드를 풀어서 받는다 — admin 패키지가
  // 바깥(outer) 도메인의 DTO 에 의존하는 걸 피하기 위해서다(신고 쪽 ReportService.createReport
  // 도 같은 이유로 admin.dto.report.ReportCreateRequest 를 받지, report 도메인의
  // ReportSubmitRequestDto 를 직접 받지 않는다).
  Long createInquiry(Long userId, String category, String title, String content,
      List<MultipartFile> images);

  // 문의 - 목록(+검색)
  PageResponse<InquiryResponse> getInquiries(InquirySearchRequest request);

  // 문의 - 상세 (이미지 + 답변 포함)
  InquiryDetailResponse getInquiryDetail(Long inquiryId);

  // 문의 - 처리(답변 등록) → 생성된 답변 id, 문의는 ANSWERED 로
  Long answerInquiry(Long inquiryId, InquiryAnswerCreateRequest request);

  // 문의 - 상태 변경 (CLOSED 종료 등)
  void changeInquiryStatus(Long inquiryId, InquiryStatus status);


}
