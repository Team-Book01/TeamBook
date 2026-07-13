package com.teambook.panorama.domain.user.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Status {
  ACTIVE("ACTIVE"),
  SUSPENDED("SUSPENDED"),
  DELETED("DELETED");

  private final String status;

}
