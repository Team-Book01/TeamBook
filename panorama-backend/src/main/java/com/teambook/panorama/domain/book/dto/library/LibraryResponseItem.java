package com.teambook.panorama.domain.book.dto.library;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Builder;

@Builder
@JsonIgnoreProperties(ignoreUnknown=true)
public record LibraryResponseItem(
  String libCode,
  String libName,
  String address,
  String tel,
  String homepage,
  String operatingTime,
  Boolean hasBook,
  Boolean loanAvailable
) { }
