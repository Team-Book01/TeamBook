package com.teambook.panorama.domain.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.admin.entity.Inquiry;

/**
 * 문의 쓰기·상세 전용 JPA 리포지토리. (목록은 MyBatis AdminMapper.selectInquiries)
 */
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
}
