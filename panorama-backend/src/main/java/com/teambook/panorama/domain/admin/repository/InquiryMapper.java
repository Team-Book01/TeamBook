package com.teambook.panorama.domain.admin.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.teambook.panorama.domain.admin.dto.inquiry.InquiryResponse;
import com.teambook.panorama.domain.admin.dto.inquiry.InquirySearchRequest;

/**
 * 문의 목록 조회 전용 MyBatis 매퍼. (검색 조건 조합이 많아 동적 SQL 로 처리)
 *
 * <p>상세/답변 등록/상태 변경은 연관 엔티티가 있어 JPA 로 간다. — InquiryServiceImpl 참고</p>
 */
@Mapper
public interface InquiryMapper {

  /** 문의 목록(+검색). 첨부 이미지는 nested select 로 채운다. */
  List<InquiryResponse> selectInquiries(InquirySearchRequest request);

  /** 위 검색 조건과 동일한 조건의 전체 건수 */
  long countInquiry(InquirySearchRequest request);
}
