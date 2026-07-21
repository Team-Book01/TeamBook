package com.teambook.panorama.domain.book.dto.popularBook;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PopularBookResponse(
  Integer resultNum,
  List<PopularBookDocWrapper> docs
) {

}
