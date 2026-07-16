package com.teambook.panorama.domain.book.dto.library;

import java.util.List;

import lombok.Builder;

@Builder
public record LibraryListResponse(
  Integer total,
  List<LibraryResponseItem> libs) {
}
