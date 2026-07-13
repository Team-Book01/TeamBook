package com.teambook.panorama.domain.admin.service;

import com.teambook.panorama.domain.admin.dto.inquiry.InquiryAnswerCreateRequest;
import com.teambook.panorama.domain.admin.dto.inquiry.InquiryDetailResponse;
import com.teambook.panorama.domain.admin.dto.inquiry.InquiryResponse;
import com.teambook.panorama.domain.admin.dto.inquiry.InquirySearchRequest;
import com.teambook.panorama.domain.admin.entity.type.InquiryStatus;
import com.teambook.panorama.global.response.PageResponse;

public interface InquiryService {

  // 문의 - 목록(+검색)
  PageResponse<InquiryResponse> getInquiries(InquirySearchRequest request);

  // 문의 - 상세 (이미지 + 답변 포함)
  InquiryDetailResponse getInquiryDetail(Long inquiryId);

  // 문의 - 처리(답변 등록) → 생성된 답변 id, 문의는 ANSWERED 로
  Long answerInquiry(Long inquiryId, InquiryAnswerCreateRequest request);

  // 문의 - 상태 변경 (CLOSED 종료 등)
  void changeInquiryStatus(Long inquiryId, InquiryStatus status);


}
