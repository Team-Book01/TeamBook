package com.teambook.panorama.domain.book.dto.detail;

import java.math.BigDecimal;

public record BookDetailResponse(
  String isbn,
  String title,
  String author,
  String publisher,
  String pubdate,
  //image_url
  String image,
  //shop_url
  String link,
  String description,
  BigDecimal avgRating,
  int reviewCount,
  int bookmarkCount,
  int postCount,
  boolean isBookmarked
) {

}
