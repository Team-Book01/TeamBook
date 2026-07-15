package com.teambook.panorama.domain.book.dto.review;

import java.math.BigDecimal;

import lombok.Builder;

@Builder
public record RatingCount(
  BigDecimal rating,
  int count
) {

}
