package com.teambook.panorama.domain.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.admin.entity.InquiryImage;

/**
 * 문의 이미지 쓰기 전용 JPA 리포지토리.
 *
 * <p>post_images/notice_images 와 달리 inquiry_id 가 NOT NULL 이라 "먼저 업로드해 두고
 * 나중에 연결"하는 흐름이 없다 — 문의 생성 시 이미지를 바로 소유자와 함께 저장하므로
 * findByImageKeyIn 같은 재연결용 조회가 필요 없다.</p>
 */
public interface InquiryImageRepository extends JpaRepository<InquiryImage, Long> {
}
