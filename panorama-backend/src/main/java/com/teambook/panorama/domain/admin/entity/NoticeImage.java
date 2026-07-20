package com.teambook.panorama.domain.admin.entity;

import com.teambook.panorama.global.entity.BaseTimeEntity;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 공지사항 본문 이미지 (notice_images). 구조·수명주기 모두 {@code PostImage} 와 같다.
 *
 * <p>notice 가 null 인 상태로 만들어진다 — 에디터가 공지 저장 전에 업로드하기 때문이다.
 * 공지 저장 시 {@link #attachTo(Notice)} 로 연결하고, 오래 null 로 남은 행은 고아 이미지다.</p>
 */
@Entity
@Table(name = "notice_images")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class NoticeImage extends BaseTimeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "notice_image_id")
  private Long noticeImageId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "notice_id")
  private Notice notice;

  @Column(name = "image_url", length = 1000, nullable = false)
  private String imageUrl;

  @Column(name = "image_key", length = 500, nullable = false)
  private String imageKey;

  @Column(name = "original_file_name", length = 255)
  private String originalFileName;

  @Column(name = "content_type", length = 100, nullable = false)
  private String contentType;

  @Column(name = "file_size", nullable = false)
  private Long fileSize;

  @Builder
  public NoticeImage(String imageUrl, String imageKey, String originalFileName,
      String contentType, Long fileSize) {
    this.imageUrl = imageUrl;
    this.imageKey = imageKey;
    this.originalFileName = originalFileName;
    this.contentType = contentType;
    this.fileSize = fileSize;
  }

  /**
   * 공지에 연결. 이미 같은 공지에 붙어 있으면 아무 일도 하지 않는다 — 수정 요청이 기존 키를
   * 함께 보내도 저장이 실패하지 않도록. 다른 공지에 붙은 이미지를 가로채는 것만 막는다.
   */
  public void attachTo(Notice notice) {
    if (this.notice != null && !this.notice.getNoticeId().equals(notice.getNoticeId())) {
      throw new BusinessException(ErrorCode.ALREADY_ATTACHED_IMAGE);
    }
    this.notice = notice;
  }
}
