package com.teambook.panorama.domain.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.admin.entity.Notice;

/**
 * 공지 쓰기·상세 전용 JPA 리포지토리. (목록은 MyBatis AdminMapper.selectNotices)
 */
public interface NoticeRepository extends JpaRepository<Notice, Long> {

  

}
