package com.teambook.panorama.domain.book.dto.review;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import lombok.Builder;

@Builder
public record ReviewResponse(
  int total,
  int page,
  int size,
  List<ReviewItem> reviewItems,
  Map<BigDecimal, Integer> ratingDistribution
) {

}
