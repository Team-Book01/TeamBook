package com.teambook.panorama.domain.admin.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
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
 * 문의 이미지 (inquiry_images)
 *
 * <p>created_at 만 존재하고 updated_at 컬럼이 없어 {@code BaseTimeEntity}를 상속하지 않고
 * 생성 시각만 별도로 관리한다.</p>
 */
@Entity
@Table(name = "inquiry_images")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class InquiryImage {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "inquiry_image_id")
  private Long inquiryImageId;

  /** 소속 문의 */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "inquiry_id", nullable = false)
  private Inquiry inquiry;

  /** 이미지 URL */
  @Column(name = "image_url", nullable = false, length = 500)
  private String imageUrl;

  /** 이미지 키(스토리지 식별자) */
  @Column(name = "image_key", nullable = false, length = 500)
  private String imageKey;

  /** 원본 파일명 */
  @Column(name = "original_file_name", length = 255)
  private String originalFileName;

  /** 콘텐츠 타입 (MIME) */
  @Column(name = "content_type", length = 100)
  private String contentType;

  /** 파일 크기 (byte) */
  @Column(name = "file_size")
  private Integer fileSize;

  /** 정렬 순서 */
  @Column(name = "sort_order", nullable = false)
  private Integer sortOrder;

  /** 생성 시각 */
  @CreatedDate
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Builder
  private InquiryImage(Inquiry inquiry, String imageUrl, String imageKey, String originalFileName,
      String contentType, Integer fileSize, Integer sortOrder) {
    this.inquiry = inquiry;
    this.imageUrl = imageUrl;
    this.imageKey = imageKey;
    this.originalFileName = originalFileName;
    this.contentType = contentType;
    this.fileSize = fileSize;
    this.sortOrder = sortOrder;
  }

  /** 연관관계 편의 메서드에서 사용 */
  void assignInquiry(Inquiry inquiry) {
    this.inquiry = inquiry;
  }
}
