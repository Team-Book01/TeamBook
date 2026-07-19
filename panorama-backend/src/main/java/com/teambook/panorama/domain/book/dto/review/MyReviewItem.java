package com.teambook.panorama.domain.book.dto.review;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Builder;

@Builder
public record MyReviewItem(
  Long reviewId,
  String isbn,
  String bookTitle,
  String bookImage,
  BigDecimal rating,
  LocalDateTime createdAt,
  String content
) {

}
