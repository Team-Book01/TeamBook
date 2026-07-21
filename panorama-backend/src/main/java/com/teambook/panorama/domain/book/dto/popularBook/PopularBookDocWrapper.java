package com.teambook.panorama.domain.book.dto.popularBook;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PopularBookDocWrapper(
  PopularBookDoc doc
) {

}
