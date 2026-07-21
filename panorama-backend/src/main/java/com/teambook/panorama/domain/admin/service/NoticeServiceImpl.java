package com.teambook.panorama.domain.admin.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.admin.dto.notice.NoticeCreateRequest;
import com.teambook.panorama.domain.admin.dto.notice.NoticeDetailResponse;
import com.teambook.panorama.domain.admin.dto.notice.NoticePublicSearchRequest;
import com.teambook.panorama.domain.admin.dto.notice.NoticeResponse;
import com.teambook.panorama.domain.admin.dto.notice.NoticeSearchRequest;
import com.teambook.panorama.domain.admin.dto.notice.NoticeUpdateRequest;
import com.teambook.panorama.domain.admin.dto.notice.PublicNoticeDetailResponse;
import com.teambook.panorama.domain.admin.dto.notice.PublicNoticeResponse;
import com.teambook.panorama.domain.admin.entity.Notice;
import com.teambook.panorama.domain.admin.entity.type.NoticeStatus;
import com.teambook.panorama.domain.admin.entity.NoticeImage;
import com.teambook.panorama.domain.admin.repository.NoticeImageRepository;
import com.teambook.panorama.domain.admin.repository.NoticeMapper;
import com.teambook.panorama.domain.admin.repository.NoticeRepository;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;
import com.teambook.panorama.global.response.PageResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeServiceImpl implements NoticeService {

  private final NoticeRepository noticeRepository; // 작성/수정 (JPA)
  private final NoticeMapper noticeMapper; // 조회-목록(+검색)/상세 (MyBatis)
  private final NoticeImageRepository noticeImageRepository; // 본문 이미지 소유자 연결 (JPA)

  @Override
  @Transactional
  public NoticeResponse saveNotice(NoticeCreateRequest request) {
    Notice notice = noticeRepository.save(request.toEntity());
    attachImages(notice, request.imageKeys());
    NoticeResponse response = NoticeResponse.from(notice);
    return response;
  }

  /**
   * 에디터가 먼저 올려둔 이미지(notice_id = null)에 소유자를 채운다.
   *
   * <p>이 단계가 없으면 이미지가 계속 소유자 없는 상태로 남아, 고아 이미지 정리 배치가
   * 도는 순간 본문에서 사라진다.</p>
   *
   * <p>키 개수가 맞지 않으면 실패시킨다. 없는 키를 조용히 넘기면 본문에는 이미지가 보이는데
   * DB 에는 연결 기록이 없는 상태가 되어, 나중에 원인을 찾기 어렵다.</p>
   */
  private void attachImages(Notice notice, List<String> imageKeys) {
    if (imageKeys == null || imageKeys.isEmpty()) {
      return;
    }
    List<NoticeImage> images = noticeImageRepository.findByImageKeyIn(imageKeys);
    if (images.size() != imageKeys.size()) {
      throw new BusinessException(ErrorCode.IMAGE_NOT_FOUND);
    }
    for (NoticeImage image : images) {
      image.attachTo(notice);
    }
  }

  @Override
  public PageResponse<NoticeResponse> getNotices(NoticeSearchRequest request) {
    List<NoticeResponse> contents = noticeMapper.selectNotices(request);
    long total = noticeMapper.countNotices(request);
    return PageResponse.of(contents, request.page(), request.size(), total);
  }

  @Override
  public NoticeDetailResponse getNoticeDetail(Long noticeId) {
    return noticeMapper.selectNoticeDetail(noticeId)
        .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
  }

  /**
   * 공지 수정. 변경은 JPA(더티체킹)로 하고, 응답은 MyBatis 상세 조회로 다시 만든다
   * (nickname 은 users 조인으로만 채워져 엔티티에서 바로 못 만듦).
   * MyBatis 쿼리는 Hibernate 를 거치지 않아 auto-flush 대상이 아니다.
   * flush 를 빼면 재조회가 수정 전 값을 읽는다.
   */
  @Override
  @Transactional
  public NoticeDetailResponse updateNotice(Long noticeId, NoticeUpdateRequest request) {
    Notice notice = noticeRepository.findById(noticeId)
        .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
    notice.update(request.category(), request.title(), request.content(),
        request.pinned(), request.important());
    attachImages(notice, request.imageKeys());   // 이번 수정에서 새로 올린 이미지 연결
    noticeRepository.flush();   // 재조회 전 UPDATE를 DB에 반영

    return noticeMapper.selectNoticeDetail(noticeId)
        .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
  }

  /**
   * 공지 상태 변경(게시/숨김/삭제). updateNotice 와 같은 JPA-write → flush → MyBatis-reread 순서.
   * HIDDEN/DELETED 공지는 공개 목록·상세 쿼리가 status='ACTIVE' 로 걸러 사용자에게 노출되지 않는다.
   */
  @Override
  @Transactional
  public NoticeDetailResponse changeNoticeStatus(Long noticeId, NoticeStatus status) {
    Notice notice = noticeRepository.findById(noticeId)
        .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
    notice.changeStatus(status);
    noticeRepository.flush();   // 재조회 전 UPDATE를 DB에 반영

    return noticeMapper.selectNoticeDetail(noticeId)
        .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
  }

  @Override
  public PageResponse<PublicNoticeResponse> getPublicNotices(NoticePublicSearchRequest request) {
    List<PublicNoticeResponse> contents = noticeMapper.selectPublicNotices(request);
    long total = noticeMapper.countPublicNotices(request);
    return PageResponse.of(contents, request.page(), request.size(), total);
  }

  /**
   * 공개 상세 조회 + 조회수 1 증가. updateNotice 와 같은 JPA-write → flush → MyBatis-reread
   * 순서를 쓴다 — 안 그러면 재조회가 증가 전 조회수를 읽는다.
   *
   * <p>JPA 로드 단계에서 status 를 ACTIVE 로 한 번 더 거른다. HIDDEN/DELETED 공지를 ID 로
   * 찍어 들어와도 조회수가 오르지 않게 막는 것 — 재조회 쿼리도 status='ACTIVE' 를 걸고 있어
   * 이중 방어다.</p>
   */
  @Override
  @Transactional
  public PublicNoticeDetailResponse getPublicNoticeDetail(Long noticeId) {
    Notice notice = noticeRepository.findById(noticeId)
        .filter(n -> n.getStatus() == NoticeStatus.ACTIVE)
        .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
    notice.increaseViewCount();
    noticeRepository.flush();

    return noticeMapper.selectPublicNoticeDetail(noticeId)
        .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
  }

}
