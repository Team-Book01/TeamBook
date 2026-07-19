package com.teambook.panorama.domain.book.dto.library;

import lombok.Builder;

@Builder

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
