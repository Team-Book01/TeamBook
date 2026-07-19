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
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookSearchService {
  private final NaverBookClient naverBookClient;
  private final BookStatsMapper bookStatsMapper;


  
//검색 -> 네이버 받아오고 -> isbn목록생성 -> db에서 스탯 받아오고
//북마크 왁인하고 -> response로 만들어서 리턴
  public BookSearchResponse findBooks(String keyword, Integer display, Integer start, String sort, Long userId) {

    //빈문자열 검색했을 때
    if (keyword == null || keyword.isBlank()) return new BookSearchResponse(0, start, display, List.of());
    //네이버 검색 먼저
    NaverBookResponse naverBookResponse = naverBookClient.search(keyword, display, start, sort);

    //네이버 호출 결과 없을 때
    if (naverBookResponse.total() == 0 ) return new BookSearchResponse(0, start, display, List.of());

    //네이버검색 도서 isbn 리스트
    List<String> isbns = naverBookResponse.items().stream().map(NaverBookItem::isbn).toList();

    //네이버검색도서 -> DB에서 각 도서별 stats 리스트(dto 파악할 것)
    List<BookStatsDto> bookStatsDtos = bookStatsMapper.selectBookStatsByIsbns(isbns);
    
    //목록 도서의 해당유저 북마크 여부 파악
    Set<String> bookmarkedIsbns = bookStatsMapper.selectBookmarkedIsbns(userId, isbns).stream().collect(Collectors.toSet());

    //isbn으로 stats 꺼내기위한 Map
    Map<String, BookStatsDto> statsMap = 
    bookStatsDtos.stream().collect(Collectors.toMap(BookStatsDto::isbn, stat -> stat));

    //네이버 검색 목록으로 response 리턴
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
      .description(naverBook.description())
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

  //책 단건 상세 조회
  public BookSearchItem findBookByIsbn(String isbn, Long userId){
    //네이버 단건 조회 -> 없는 isbn 예외 처리
    var items = naverBookClient.search(isbn, 1, 1, "sim").items();
    if (items.isEmpty()) {
      throw new BusinessException(ErrorCode.BOOK_NOT_FOUND);
    }
    NaverBookItem item = items.getFirst();
    //DB stats조회
    BookStatsDto stats = bookStatsMapper.selectBookStatsByIsbns(List.of(isbn)).stream().findFirst().orElse(null);
    //북마크 여부
    boolean isBookmarked = !bookStatsMapper.selectBookmarkedIsbns(userId, List.of(isbn)).isEmpty();


    return BookSearchItem.builder()
    .isbn(isbn)
    .author(item.author())
    .avgRating(stats != null ? stats.avgRating() : BigDecimal.ZERO)
    .reviewCount(stats != null ? stats.reviewCount() : 0)
    .bookmarkCount(stats != null ? stats.bookmarkCount() : 0)
    .image(item.image())
    .link(item.link())
    .discount(item.discount())
    .title(item.title())
    .isBookmarked(isBookmarked)
    .publisher(item.publisher())
    .pubdate(item.pubdate())
    .description(item.description())
    .build();
    }

  }