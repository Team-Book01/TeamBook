package com.teambook.panorama.domain.book.dto.bookmark;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record BookmarkRequest(
  @NotBlank
  String isbn,
  String title,
  String author,
  String publisher,
  String pubdate,
  //image_url
  String image,
  //shop_url
  String link,
  String description
) {

}
