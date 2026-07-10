package com.teambook.panorama.domain.book.dto.search;

import lombok.Builder;

@Builder
public record BookmarkResponse(
  boolean isBookmarked,
  int bookmarkCount
) {}
