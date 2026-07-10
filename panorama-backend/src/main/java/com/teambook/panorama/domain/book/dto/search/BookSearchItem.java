package com.teambook.panorama.domain.book.dto.search;

import java.math.BigDecimal;
import lombok.Builder;


@Builder
public record BookSearchItem(
  String isbn,
  String title,
  String author,
  String publisher,
  String pubdate,
  //image_url
  String image,
  //shop_url
  String link,
  String discount,
  BigDecimal avgRating,
  Integer reviewCount,
  Integer bookmarkCount,
  Boolean isBookmarked
) {

}
