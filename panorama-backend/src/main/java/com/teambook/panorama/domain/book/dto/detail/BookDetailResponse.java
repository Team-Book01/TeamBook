package com.teambook.panorama.domain.book.dto.detail;

import java.math.BigDecimal;

import com.teambook.panorama.domain.book.dto.search.BookSearchItem;

public record BookDetailResponse(
  String isbn,
  String title,
  String author,
  String publisher,
  String pubdate,
  //image_url
  String image,
  //shop_url
  String link,
  String discount,
  String description,
  BigDecimal avgRating,
  int reviewCount,
  int bookmarkCount,
  int postCount,
  boolean isBookmarked
) {
  public static BookDetailResponse of(BookSearchItem item) {
   return new BookDetailResponse(item.isbn(), item.title(), item.author(), item.publisher(), item.pubdate(), item.image(), item.link(), item.discount(), item.description(), item.avgRating(), item.reviewCount(), item.bookmarkCount(), 0, item.isBookmarked()); 
  }
}
