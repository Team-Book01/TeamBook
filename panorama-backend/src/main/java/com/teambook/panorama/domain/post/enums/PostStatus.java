package com.teambook.panorama.domain.post.enums;

import lombok.Getter;

@Getter
public enum PostStatus {
  ACTIVE("정상"),
  DELETED("삭제"),
  HIDDEN("숨김");

  private final String postStatusLabel;

  PostStatus(String postStatusLabel) {
    this.postStatusLabel = postStatusLabel;
  }
}
