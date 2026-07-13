package com.teambook.panorama.domain.admin.service;

import com.teambook.panorama.domain.admin.dto.notice.NoticeCreateRequest;
import com.teambook.panorama.domain.admin.dto.notice.NoticeDetailResponse;
import com.teambook.panorama.domain.admin.dto.notice.NoticeResponse;
import com.teambook.panorama.domain.admin.dto.notice.NoticeSearchRequest;
import com.teambook.panorama.domain.admin.dto.notice.NoticeUpdateRequest;
import com.teambook.panorama.global.response.PageResponse;

public interface NoticeService {

  NoticeResponse saveNotice(NoticeCreateRequest request);

  PageResponse<NoticeResponse> getNotices(NoticeSearchRequest request);

  NoticeDetailResponse getNoticeDetail(Long noticeId);

  NoticeDetailResponse updateNotice(Long noticeId, NoticeUpdateRequest request);


}
