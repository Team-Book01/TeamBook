package com.teambook.panorama.domain.book.dto.naver;

import lombok.Builder;

@Builder
public record NaverBookItem(
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
  String description
) {

}
