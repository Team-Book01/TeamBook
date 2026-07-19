package com.teambook.panorama.domain.book.dto.review;

import java.util.List;

public record MyReviewResponse(
  int total,
  List<MyReviewItem> reviewItems
) {

}
