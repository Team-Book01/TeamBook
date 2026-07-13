package com.teambook.panorama.domain.admin.entity;

import com.teambook.panorama.global.entity.BaseTimeEntity;

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
 * 문의 답변 (inquiry_answers)
 */
@Entity
@Table(name = "inquiry_answers")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class InquiryAnswer extends BaseTimeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "inquiry_answer_id")
  private Long inquiryAnswerId;

  /** 대상 문의 */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "inquiry_id", nullable = false)
  private Inquiry inquiry;

  /** 답변 관리자(사용자) ID */
  @Column(name = "user_id", nullable = false)
  private Long userId;

  /** 내용 */
  @Column(name = "content", nullable = false, columnDefinition = "TEXT")
  private String content;

  @Builder
  private InquiryAnswer(Inquiry inquiry, Long userId, String content) {
    this.inquiry = inquiry;
    this.userId = userId;
    this.content = content;
  }

  /** 답변 내용 수정 */
  public void update(String content) {
    this.content = content;
  }
}
