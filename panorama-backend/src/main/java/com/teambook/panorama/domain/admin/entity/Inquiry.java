package com.teambook.panorama.domain.admin.entity;

import java.util.ArrayList;
import java.util.List;

import com.teambook.panorama.domain.admin.entity.type.InquiryStatus;
import com.teambook.panorama.global.entity.BaseTimeEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 문의 (inquiries)
 */
@Entity
@Table(name = "inquiries")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Inquiry extends BaseTimeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "inquiry_id")
  private Long inquiryId;

  /** 작성자 사용자 ID */
  @Column(name = "user_id", nullable = false)
  private Long userId;

  /** 문의 유형 */
  @Column(name = "category", nullable = false, length = 50)
  private String category;

  /** 제목 */
  @Column(name = "title", nullable = false, length = 255)
  private String title;

  /** 내용 */
  @Column(name = "content", nullable = false, columnDefinition = "TEXT")
  private String content;

  /** 처리 상태 (PENDING, ANSWERED, CLOSED, DELETED) */
  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  private InquiryStatus status;

  /** 첨부 이미지 목록 */
  @OneToMany(mappedBy = "inquiry", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<InquiryImage> images = new ArrayList<>();

  @Builder
  private Inquiry(Long userId, String category, String title, String content, InquiryStatus status) {
    this.userId = userId;
    this.category = category;
    this.title = title;
    this.content = content;
    this.status = status != null ? status : InquiryStatus.PENDING;
  }

  /** 문의 내용 수정 */
  public void update(String category, String title, String content) {
    this.category = category;
    this.title = title;
    this.content = content;
  }

  /** 상태 변경 */
  public void changeStatus(InquiryStatus status) {
    this.status = status;
  }

  /** 답변 완료 처리 */
  public void markAnswered() {
    this.status = InquiryStatus.ANSWERED;
  }
}
