package com.teambook.panorama.domain.admin.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.admin.dto.community.CommunityContentDetailResponse;
import com.teambook.panorama.domain.admin.dto.community.CommunityContentResponse;
import com.teambook.panorama.domain.admin.dto.community.CommunityContentSearchRequest;
import com.teambook.panorama.domain.admin.dto.community.CommunityProcessRequest;
import com.teambook.panorama.domain.admin.entity.type.ContentAction;
import com.teambook.panorama.domain.admin.repository.CommunityMapper;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;
import com.teambook.panorama.global.response.PageResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommunityServiceImpl implements CommunityService {

  private final CommunityMapper communityMapper;   // Post/Comment 엔티티가 없어 조회·처리 모두 MyBatis

  @Override
  public PageResponse<CommunityContentResponse> getContents(CommunityContentSearchRequest request) {
    List<CommunityContentResponse> content = communityMapper.selectContents(request);
    long total = communityMapper.countContents(request);
    return PageResponse.of(content, request.page(), request.size(), total);
  }

  @Override
  public CommunityContentDetailResponse getContentDetail(String contentType, Long contentId) {
    return communityMapper.selectContentDetail(normalize(contentType), contentId)
        .orElseThrow(() -> new BusinessException(ErrorCode.CONTENT_NOT_FOUND));
  }

  /**
   * 콘텐츠 조치(숨김/삭제/숨김 해제) + 같은 대상 미처리 신고 일괄 RESOLVE + 조치 로그. 한 트랜잭션.
   * <p>신고 처리 플로우(processReport)와 동일하게, 콘텐츠를 조치하면 그 콘텐츠에 걸린
   * 미처리 신고도 함께 종결해 유령 신고를 남기지 않는다.</p>
   */
  @Override
  @Transactional
  public void processContent(String contentType, Long contentId, CommunityProcessRequest request) {
    String type = normalize(contentType);
    String current = communityMapper.selectContentStatus(type, contentId)
        .orElseThrow(() -> new BusinessException(ErrorCode.CONTENT_NOT_FOUND));

    // 되돌리기는 숨김 상태에서만 허용한다. 삭제도 soft delete 라 기술적으로는 되살아나지만,
    // 작성자가 스스로 지운 글까지 관리자가 복구할 수 있게 되므로 열어두지 않는다.
    if (request.action() == ContentAction.ACTIVE && !"HIDDEN".equals(current)) {
      throw new BusinessException(ErrorCode.CONTENT_RESTORE_NOT_ALLOWED);
    }

    LocalDateTime now = LocalDateTime.now();

    // ① 콘텐츠 조치 (POST/COMMENT/REVIEW 모두 status 값이 ACTIVE/HIDDEN/DELETED 라 action 이름 그대로)
    communityMapper.updateContentStatus(type, contentId, request.action().name());

    // ② 같은 대상의 미처리 신고를 모두 RESOLVED (신고 처리 플로우와 일관)
    //
    // 되돌리기는 예외다. 신고를 RESOLVED 로 닫으면 "조치했다"는 뜻이 되는데, 숨김 해제는
    // 오히려 조치를 취소한 것이다. 그 신고들을 어떻게 볼지(반려인지 재검토인지)는 관리자가
    // 신고 관리에서 판단할 몫이라 여기서 대신 닫지 않는다.
    if (request.action() != ContentAction.ACTIVE) {
      communityMapper.resolveReportsByTarget(type, contentId, request.handlerUserId(), now);
    }

    // ③ 관리자 조치 로그
    communityMapper.insertAdminActionLog(request.handlerUserId(), type, contentId,
        request.action().name(), request.reason());
  }

  private String normalize(String contentType) {
    return contentType == null ? "" : contentType.toUpperCase(Locale.ROOT);
  }
}
