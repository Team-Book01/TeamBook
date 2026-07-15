package com.teambook.panorama.domain.book.dto.review;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Builder;

@Builder
public record ReviewItem(
  Long reviewId,
  String nickname,
  BigDecimal rating,
  String content,
  LocalDateTime createdAt,
  boolean isMine) {

}
