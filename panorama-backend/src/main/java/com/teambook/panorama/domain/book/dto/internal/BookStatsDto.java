package com.teambook.panorama.domain.book.dto.internal;

import java.math.BigDecimal;

import lombok.Builder;

@Builder
public record BookStatsDto(
  String isbn,
  BigDecimal avgRating,
  Integer reviewCount,
  Integer bookmarkCount
) {

}