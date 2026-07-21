package com.teambook.panorama.domain.admin.repository;

import java.util.List;
import java.util.Optional;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.teambook.panorama.domain.admin.dto.notice.NoticeDetailResponse;
import com.teambook.panorama.domain.admin.dto.notice.NoticePublicSearchRequest;
import com.teambook.panorama.domain.admin.dto.notice.NoticeResponse;
import com.teambook.panorama.domain.admin.dto.notice.NoticeSearchRequest;
import com.teambook.panorama.domain.admin.dto.notice.PublicNoticeDetailResponse;
import com.teambook.panorama.domain.admin.dto.notice.PublicNoticeResponse;

/**
 * 공지 조회(목록/상세) MyBatis 매퍼. 작성/수정은 JPA(NoticeRepository).
 * 상세는 작성자 닉네임(users 조인)이 있어 MyBatis로 조회한다.
 */
@Mapper
public interface NoticeMapper {

  List<NoticeResponse> selectNotices(NoticeSearchRequest request);

  long countNotices(NoticeSearchRequest request);

  Optional<NoticeDetailResponse> selectNoticeDetail(@Param("noticeId") Long noticeId);

  // 공개(비관리자) 조회. status = ACTIVE 를 쿼리에 하드코딩해 클라이언트가 우회할 수 없다.
  List<PublicNoticeResponse> selectPublicNotices(NoticePublicSearchRequest request);

  long countPublicNotices(NoticePublicSearchRequest request);

  Optional<PublicNoticeDetailResponse> selectPublicNoticeDetail(@Param("noticeId") Long noticeId);
}
