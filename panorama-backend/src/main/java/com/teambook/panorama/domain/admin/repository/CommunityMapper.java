package com.teambook.panorama.domain.admin.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.teambook.panorama.domain.admin.dto.community.CommunityContentDetailResponse;
import com.teambook.panorama.domain.admin.dto.community.CommunityContentResponse;
import com.teambook.panorama.domain.admin.dto.community.CommunityContentSearchRequest;

/**
 * 커뮤니티 콘텐츠(게시글/댓글/리뷰) 관리 MyBatis 매퍼.
 * Post/Comment 엔티티가 없어 조회·처리 모두 MyBatis. target_type 으로 테이블 분기.
 */
@Mapper
public interface CommunityMapper {

  // 목록 (contentType 로 테이블 분기)
  List<CommunityContentResponse> selectContents(CommunityContentSearchRequest request);

  long countContents(CommunityContentSearchRequest request);

  // 상세
  Optional<CommunityContentDetailResponse> selectContentDetail(
      @Param("contentType") String contentType, @Param("contentId") Long contentId);

  // 처리
  /** 존재 확인 + 현재 상태 */
  Optional<String> selectContentStatus(
      @Param("contentType") String contentType, @Param("contentId") Long contentId);

  /** 콘텐츠 status 변경 (HIDDEN/DELETED). 변경 행 수 반환 */
  int updateContentStatus(
      @Param("contentType") String contentType,
      @Param("contentId") Long contentId,
      @Param("status") String status);

  /** 같은 대상(콘텐츠)의 미처리 신고를 모두 RESOLVED (신고 처리 플로우와 일관) */
  int resolveReportsByTarget(
      @Param("targetType") String targetType,
      @Param("targetId") Long targetId,
      @Param("handlerUserId") Long handlerUserId,
      @Param("processedAt") LocalDateTime processedAt);

  /** 관리자 조치 로그 1건 */
  int insertAdminActionLog(
      @Param("userId") Long userId,
      @Param("targetType") String targetType,
      @Param("targetId") Long targetId,
      @Param("actionType") String actionType,
      @Param("reason") String reason);
}
