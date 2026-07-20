package com.teambook.panorama.domain.admin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.admin.entity.NoticeImage;

public interface NoticeImageRepository extends JpaRepository<NoticeImage, Long> {

  /** 공지 저장 시 본문에 남아 있는 키들만 골라 연결하기 위한 조회 (PostImage 와 동일한 흐름) */
  List<NoticeImage> findByImageKeyIn(List<String> imageKeys);
}
