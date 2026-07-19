package com.teambook.panorama.domain.book.dto.bookmark;

import java.util.List;

public record MyBookmarkResponse(
  int total,
  List<MyBookmarkItem> myBookmarkItems
) {

}
