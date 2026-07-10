package com.teambook.panorama.domain.book.entity;

import java.math.BigDecimal;

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
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "book_reviews")
public class BookReview extends BaseTimeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "review_id", nullable = false)
  private Long reviewId;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "book_id", nullable = false)
  private Book book;

  @Column(name = "rating", nullable = false)
  private BigDecimal rating;

  @Column(name = "content", nullable = true, columnDefinition = "TEXT")
  private String content;

  @Column(name = "status", nullable = false, length = 20)
  private String status;

  public BookReview(Long userId, Book book, BigDecimal rating, String content) {
    this.userId = userId;
    this.book = book;
    this.rating = rating;
    this.content = content;
    this.status = "ACTIVE";
  }

  
}
