package com.teambook.panorama.domain.admin.service;

import com.teambook.panorama.domain.admin.dto.community.CommunityContentDetailResponse;
import com.teambook.panorama.domain.admin.dto.community.CommunityContentResponse;
import com.teambook.panorama.domain.admin.dto.community.CommunityContentSearchRequest;
import com.teambook.panorama.domain.admin.dto.community.CommunityProcessRequest;
import com.teambook.panorama.global.response.PageResponse;

/**
 * 커뮤니티 콘텐츠(게시글/댓글/리뷰) 관리 서비스. (조회·처리 모두 MyBatis)
 */
public interface CommunityService {

  PageResponse<CommunityContentResponse> getContents(CommunityContentSearchRequest request);

  CommunityContentDetailResponse getContentDetail(String contentType, Long contentId);

  void processContent(String contentType, Long contentId, CommunityProcessRequest request);
}
