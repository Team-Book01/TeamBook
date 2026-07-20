package com.teambook.panorama.domain.admin.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.teambook.panorama.domain.admin.dto.inquiry.InquiryAnswerCreateRequest;
import com.teambook.panorama.domain.admin.dto.inquiry.InquiryAnswerResponse;
import com.teambook.panorama.domain.admin.dto.inquiry.InquiryDetailResponse;
import com.teambook.panorama.domain.admin.dto.inquiry.InquiryResponse;
import com.teambook.panorama.domain.admin.dto.inquiry.InquirySearchRequest;
import com.teambook.panorama.domain.admin.entity.Inquiry;
import com.teambook.panorama.domain.admin.entity.InquiryAnswer;
import com.teambook.panorama.domain.admin.entity.InquiryImage;
import com.teambook.panorama.domain.admin.entity.type.InquiryStatus;
import com.teambook.panorama.domain.admin.repository.InquiryAnswerRepository;
import com.teambook.panorama.domain.admin.repository.InquiryImageRepository;
import com.teambook.panorama.domain.admin.repository.InquiryMapper;
import com.teambook.panorama.domain.admin.repository.InquiryRepository;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;
import com.teambook.panorama.global.response.PageResponse;
import com.teambook.panorama.global.storage.ImageStorageService;
import com.teambook.panorama.global.storage.StoredImage;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InquiryServiceImpl implements InquiryService {

  private final InquiryRepository inquiryRepository;  // 문의 상세·쓰기(JPA)
  private final InquiryMapper inquiryMapper; // 문의 목록 조회(MyBatis)
  private final InquiryAnswerRepository inquiryAnswerRepository;  // 문의 답변(JPA)
  private final InquiryImageRepository inquiryImageRepository;  // 문의 첨부 이미지(JPA)
  private final ImageStorageService imageStorageService;  // 검증·디스크 저장 공통 처리

  /**
   * 문의 등록. post_images/notice_images 와 달리 inquiry_images.inquiry_id 가 NOT NULL 이라
   * "먼저 업로드해 두고 나중에 연결"하는 2단계 흐름을 쓰지 않는다 — 본문과 파일을 한 트랜잭션에서
   * 함께 저장한다. sortOrder 는 업로드 목록에서의 순서를 그대로 쓴다.
   */
  @Override
  @Transactional
  public Long createInquiry(Long userId, String category, String title, String content,
      List<MultipartFile> images) {
    Inquiry inquiry = inquiryRepository.save(Inquiry.builder()
        .userId(userId)
        .category(category)
        .title(title)
        .content(content)
        .build());

    if (images != null && !images.isEmpty()) {
      List<StoredImage> stored = imageStorageService.store(images);
      int sortOrder = 0;
      for (StoredImage image : stored) {
        inquiryImageRepository.save(InquiryImage.builder()
            .inquiry(inquiry)
            .imageUrl(image.imageUrl())
            .imageKey(image.imageKey())
            .originalFileName(image.originalFileName())
            .contentType(image.contentType())
            .fileSize((int) image.fileSize())
            .sortOrder(sortOrder++)
            .build());
      }
    }

    return inquiry.getInquiryId();
  }

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
