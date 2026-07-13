package com.teambook.panorama.domain.admin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.admin.entity.InquiryAnswer;

/**
 * 문의 답변 JPA 리포지토리.
 */
public interface InquiryAnswerRepository extends JpaRepository<InquiryAnswer, Long> {

  /** 특정 문의의 답변들 (오래된 순) */
  List<InquiryAnswer> findByInquiry_InquiryIdOrderByCreatedAtAsc(Long inquiryId);
}
