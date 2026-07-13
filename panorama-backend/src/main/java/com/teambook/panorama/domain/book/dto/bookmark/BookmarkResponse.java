package com.teambook.panorama.domain.book.dto.bookmark;

import lombok.Builder;

@Builder
public record BookmarkResponse(
  boolean isBookmarked,
  Integer bookmarkCount
) {}
