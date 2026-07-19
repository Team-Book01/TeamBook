package com.teambook.panorama.domain.book.dto.bookmark;

import java.time.LocalDateTime;

import lombok.Builder;

@Builder
public record MyBookmarkItem(
  String isbn,
  String bookTitle,
  String author,
  String bookImage,
  LocalDateTime createdAt
) {

}
