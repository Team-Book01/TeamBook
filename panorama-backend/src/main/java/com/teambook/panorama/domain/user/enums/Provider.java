package com.teambook.panorama.domain.user.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Provider {
  LOCAL("LOCAL"),
  GOOGLE("GOOGLE"),
  NAVER("NAVER"),
  KAKAO("KAKAO");

  private final String provider;
}
