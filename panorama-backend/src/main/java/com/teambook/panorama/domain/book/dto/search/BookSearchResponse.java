package com.teambook.panorama.domain.book.dto.search;

import java.util.List;

import lombok.Builder;

@Builder
public record BookSearchResponse(
  int total,
  int start,
  int display,
  List<BookSearchItem> items
) {}
