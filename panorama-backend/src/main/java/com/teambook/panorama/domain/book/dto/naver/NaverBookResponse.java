package com.teambook.panorama.domain.book.dto.naver;
import java.util.List;
import lombok.Builder;

@Builder
public record NaverBookResponse(
  int total,
  int display,
  int start,
  List<NaverBookItem> items
) {}
