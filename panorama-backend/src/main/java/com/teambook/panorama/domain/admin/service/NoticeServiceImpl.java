package com.teambook.panorama.domain.admin.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.admin.dto.notice.NoticeCreateRequest;
import com.teambook.panorama.domain.admin.dto.notice.NoticeDetailResponse;
import com.teambook.panorama.domain.admin.dto.notice.NoticeResponse;
import com.teambook.panorama.domain.admin.dto.notice.NoticeSearchRequest;
import com.teambook.panorama.domain.admin.dto.notice.NoticeUpdateRequest;
import com.teambook.panorama.domain.admin.entity.Notice;
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

  @Override
  @Transactional
  public NoticeResponse saveNotice(NoticeCreateRequest request) {
    Notice notice = noticeRepository.save(request.toEntity());
    NoticeResponse response = NoticeResponse.from(notice);
    return response;
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
    noticeRepository.flush();   // 재조회 전 UPDATE를 DB에 반영

    return noticeMapper.selectNoticeDetail(noticeId)
        .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
  }

}
