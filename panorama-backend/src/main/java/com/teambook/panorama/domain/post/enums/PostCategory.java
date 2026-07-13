package com.teambook.panorama.domain.post.enums;

import lombok.Getter;

@Getter
public enum PostCategory {
  RECOMMEND("추천"),
  REVIEW("독후감"),
  FREE("자유");

  private final String postCategoryLabel;

  PostCategory(String postCategoryLabel) {
    this.postCategoryLabel = postCategoryLabel;
  }
}
