package com.teambook.panorama.domain.admin.entity;

import com.teambook.panorama.domain.admin.entity.type.NoticeCategory;
import com.teambook.panorama.domain.admin.entity.type.NoticeStatus;
import com.teambook.panorama.global.entity.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 공지 (notices)
 */
@Entity
@Table(name = "notices")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Notice extends BaseTimeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "notice_id")
  private Long noticeId;

  /** 작성자(관리자) 사용자 ID */
  @Column(name = "user_id", nullable = false)
  private Long userId;

  /** 공지 분류 (GENERAL, EVENT, UPDATE, MAINTENANCE 등) */
  @Enumerated(EnumType.STRING)
  @Column(name = "category", nullable = false, length = 30)
  private NoticeCategory category;

  /** 제목 */
  @Column(name = "title", nullable = false, length = 255)
  private String title;

  /** 내용 */
  @Column(name = "content", nullable = false, columnDefinition = "MEDIUMTEXT")
  private String content;

  /** 상단 고정여부 */
  @Column(name = "is_pinned", nullable = false)
  private boolean pinned;

  /** 중요 여부 */
  @Column(name = "is_important", nullable = false)
  private boolean important;

  /** 조회수 */
  @Column(name = "view_count", nullable = false)
  private Long viewCount;

  /** 상태 (ACTIVE, DELETED) */
  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  private NoticeStatus status;

  @Builder
  private Notice(Long userId, NoticeCategory category, String title, String content, boolean pinned,
      boolean important, Long viewCount, NoticeStatus status) {
    this.userId = userId;
    this.category = category;
    this.title = title;
    this.content = content;
    this.pinned = pinned;
    this.important = important;
    this.viewCount = viewCount != null ? viewCount : 0L;
    this.status = status != null ? status : NoticeStatus.ACTIVE;
  }

  /** 공지 내용 수정 */
  public void update(NoticeCategory category, String title, String content, boolean pinned,
      boolean important) {
    this.category = category;
    this.title = title;
    this.content = content;
    this.pinned = pinned;
    this.important = important;
  }

  /** soft delete */
  public void delete() {
    this.status = NoticeStatus.DELETED;
  }

  /** 공개 상세 조회 시 호출. viewCount 는 builder 에서 항상 0L 이상으로 채워져 null 이 아니다. */
  public void increaseViewCount() {
    this.viewCount = this.viewCount + 1;
  }
}
