package com.teambook.panorama.domain.admin.service;

import com.teambook.panorama.domain.admin.dto.notice.NoticeCreateRequest;
import com.teambook.panorama.domain.admin.dto.notice.NoticeDetailResponse;
import com.teambook.panorama.domain.admin.dto.notice.NoticePublicSearchRequest;
import com.teambook.panorama.domain.admin.dto.notice.NoticeResponse;
import com.teambook.panorama.domain.admin.dto.notice.NoticeSearchRequest;
import com.teambook.panorama.domain.admin.dto.notice.NoticeUpdateRequest;
import com.teambook.panorama.domain.admin.dto.notice.PublicNoticeDetailResponse;
import com.teambook.panorama.domain.admin.dto.notice.PublicNoticeResponse;
import com.teambook.panorama.global.response.PageResponse;

public interface NoticeService {

  NoticeResponse saveNotice(NoticeCreateRequest request);

  PageResponse<NoticeResponse> getNotices(NoticeSearchRequest request);

  NoticeDetailResponse getNoticeDetail(Long noticeId);

  NoticeDetailResponse updateNotice(Long noticeId, NoticeUpdateRequest request);

  // 공개(비관리자) 목록/상세. 상세는 조회수를 1 증가시킨 뒤 그 값을 응답에 반영한다.
  PageResponse<PublicNoticeResponse> getPublicNotices(NoticePublicSearchRequest request);

  PublicNoticeDetailResponse getPublicNoticeDetail(Long noticeId);

}
