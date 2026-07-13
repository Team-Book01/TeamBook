package com.teambook.panorama.domain.post.enums;

import lombok.Getter;

@Getter
public enum CommentStatus {
  ACTIVE("정상"),
  DELETED("삭제"),
  HIDDEN("숨김");

  private final String commentStatusLabel;

  CommentStatus(String commentStatusLabel) {
    this.commentStatusLabel = commentStatusLabel;
  }
}
