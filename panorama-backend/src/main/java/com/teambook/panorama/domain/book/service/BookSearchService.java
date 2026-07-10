package com.teambook.panorama.domain.book.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.teambook.panorama.domain.book.client.NaverBookClient;
import com.teambook.panorama.domain.book.dto.internal.BookStatsDto;
import com.teambook.panorama.domain.book.dto.naver.NaverBookItem;
import com.teambook.panorama.domain.book.dto.naver.NaverBookResponse;
import com.teambook.panorama.domain.book.dto.search.BookSearchItem;
import com.teambook.panorama.domain.book.dto.search.BookSearchResponse;
import com.teambook.panorama.domain.book.mapper.BookStatsMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookSearchService {
  private final NaverBookClient naverBookClient;
  private final BookStatsMapper bookStatsMapper;


  
//검색 -> 네이버 받아오고 -> isbn목록생성 -> db에서 스탯 받아오고
//북마크 왁인하고 -> response로 만들어서 리턴
  public BookSearchResponse findBooks(String keyword, Integer display, Integer start, String sort, Long userId) {
    //네이버 검색 먼저
    NaverBookResponse naverBookResponse = naverBookClient.search(keyword, display, start, sort);

    List<String> isbns = naverBookResponse.items().stream().map(NaverBookItem::isbn).toList();

    List<BookStatsDto> bookStatsDtos = bookStatsMapper.selectBookStatsByIsbns(isbns);

    Set<String> bookmarkedIsbns = bookStatsMapper.selectBookmarkedIsbns(userId, isbns).stream().collect(Collectors.toSet());

    Map<String, BookStatsDto> statsMap = 
    bookStatsDtos.stream().collect(Collectors.toMap(BookStatsDto::isbn, stat -> stat));

    List<BookSearchItem> items = naverBookResponse.items().stream().map(naverBook -> {
      String isbn = naverBook.isbn();
      BookStatsDto stat = statsMap.get(isbn);
      boolean isBookmarked = bookmarkedIsbns.contains(isbn);
      return
      BookSearchItem.builder()
      .isbn(isbn)
      .author(naverBook.author())
      .avgRating(stat != null ? stat.avgRating() : BigDecimal.ZERO)
      .reviewCount(stat != null ? stat.reviewCount() : 0)
      .bookmarkCount(stat != null ? stat.bookmarkCount() : 0)
      .image(naverBook.image())
      .link(naverBook.link())
      .discount(naverBook.discount())
      .title(naverBook.title())
      .isBookmarked(isBookmarked)
      .publisher(naverBook.publisher())
      .pubdate(naverBook.pubdate())
      .build();
    }).toList();
    BookSearchResponse response = BookSearchResponse.builder()
    .total(naverBookResponse.total())
    .display(display)
    .start(start)
    .items(items)
    .build();

    return response;
  }
  

}
