package com.teambook.panorama.global.response;

import java.util.List;

import org.springframework.data.domain.Slice;

public record SliceResponse<T>(
  List<T> content, 
  int page, 
  int size, 
  boolean hasNext
) {
    public static <T> SliceResponse<T> of(Slice<T> slice) {
      List<T> content = slice.getContent();
      int page = slice.getNumber() + 1;
      int size = slice.getSize();
      boolean hasNext = slice.hasNext();

      return new SliceResponse<T> (content, page, size, hasNext);
    }
}
