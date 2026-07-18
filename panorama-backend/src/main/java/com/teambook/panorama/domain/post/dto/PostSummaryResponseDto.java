package com.teambook.panorama.domain.post.dto;

import java.time.LocalDateTime;

import com.teambook.panorama.domain.book.entity.Book;
import com.teambook.panorama.domain.post.entity.Post;
import com.teambook.panorama.domain.post.enums.PostCategory;

public record PostSummaryResponseDto(Long postId, Long bookId, String nickname, PostCategory category, String title, String contentPreview, int viewCount, LocalDateTime createdAt, String bookTitle, String author, long likeCount, long commentCount) {
  public PostSummaryResponseDto {    // 컴팩트 생성자: record는 필드를 선언하면 모든 필드를 받는 생성자를 자동으로 만들고, 컴팩트 생성자는 이 자동 생성자에 값이 들어가기 직전에 값을 검사하는 블록을 만드는 문법이다.
    if(contentPreview != null && contentPreview.length() > 100) {
      contentPreview = contentPreview.substring(0, 97) + "...";
    }
  }

  public static PostSummaryResponseDto from(Post post) {
    Book book = post.getBook();
    if(book == null) {
      return new PostSummaryResponseDto(
      post.getPostId(), 
      null, 
      post.getUser().getNickname(), 
      post.getCategory(), 
      post.getTitle(), 
      post.getContent(), 
      post.getViewCount(), 
      post.getCreatedAt(), 
      null, 
      null,
      0,
      0);
    }
    return new PostSummaryResponseDto(
      post.getPostId(), 
      book.getBookId(), 
      post.getUser().getNickname(), 
      post.getCategory(), 
      post.getTitle(), 
      post.getContent(), 
      post.getViewCount(), 
      post.getCreatedAt(), 
      book.getTitle(), 
      book.getAuthor(),
      0,
      0);
  }
}
