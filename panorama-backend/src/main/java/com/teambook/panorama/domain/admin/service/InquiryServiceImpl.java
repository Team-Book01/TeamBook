package com.teambook.panorama.domain.admin.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.admin.dto.inquiry.InquiryAnswerCreateRequest;
import com.teambook.panorama.domain.admin.dto.inquiry.InquiryAnswerResponse;
import com.teambook.panorama.domain.admin.dto.inquiry.InquiryDetailResponse;
import com.teambook.panorama.domain.admin.dto.inquiry.InquiryResponse;
import com.teambook.panorama.domain.admin.dto.inquiry.InquirySearchRequest;
import com.teambook.panorama.domain.admin.entity.Inquiry;
import com.teambook.panorama.domain.admin.entity.InquiryAnswer;
import com.teambook.panorama.domain.admin.entity.type.InquiryStatus;
import com.teambook.panorama.domain.admin.repository.InquiryAnswerRepository;
import com.teambook.panorama.domain.admin.repository.InquiryMapper;
import com.teambook.panorama.domain.admin.repository.InquiryRepository;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;
import com.teambook.panorama.global.response.PageResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InquiryServiceImpl implements InquiryService {

  private final InquiryRepository inquiryRepository;  // 문의 상세·쓰기(JPA)
  private final InquiryMapper inquiryMapper; // 문의 목록 조회(MyBatis)
  private final InquiryAnswerRepository inquiryAnswerRepository;  // 문의 답변(JPA)

  @Override
  public PageResponse<InquiryResponse> getInquiries(InquirySearchRequest request) {
    List<InquiryResponse> content = inquiryMapper.selectInquiries(request);
    long totalElements = inquiryMapper.countInquiry(request);
    return PageResponse.of(content, request.page(), request.size(), totalElements);
  }

  @Override
  public InquiryDetailResponse getInquiryDetail(Long inquiryId) {
    // 조인/마스킹이 없어 JPA로 조회. 이미지는 엔티티 그래프(lazy, 트랜잭션 내)로, 답변은 별도 조회.
    Inquiry inquiry = inquiryRepository.findById(inquiryId)
        .orElseThrow(() -> new BusinessException(ErrorCode.INQUIRY_NOT_FOUND));
    List<InquiryAnswerResponse> answers = inquiryAnswerRepository
        .findByInquiry_InquiryIdOrderByCreatedAtAsc(inquiryId).stream()
        .map(InquiryAnswerResponse::from)
        .toList();
    return new InquiryDetailResponse(InquiryResponse.from(inquiry), answers);
  }

  @Override
  @Transactional
  public Long answerInquiry(Long inquiryId, InquiryAnswerCreateRequest request) {
    Inquiry inquiry = inquiryRepository.findById(inquiryId)
        .orElseThrow(() -> new BusinessException(ErrorCode.INQUIRY_NOT_FOUND));
    InquiryAnswer answer = inquiryAnswerRepository.save(request.toEntity(inquiry));
    inquiry.markAnswered(); // 답변 등록 시 문의를 ANSWERED 로 (더티체킹)
    return answer.getInquiryAnswerId();
  }

  @Override
  @Transactional
  public void changeInquiryStatus(Long inquiryId, InquiryStatus status) {
    Inquiry inquiry = inquiryRepository.findById(inquiryId)
        .orElseThrow(() -> new BusinessException(ErrorCode.INQUIRY_NOT_FOUND));
    inquiry.changeStatus(status);
  }

}
