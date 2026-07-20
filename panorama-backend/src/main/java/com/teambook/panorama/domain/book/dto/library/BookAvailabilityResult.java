package com.teambook.panorama.domain.book.dto.library;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record BookAvailabilityResult(
  String hasBook,
  String loanAvailable
) {

}
