package com.teambook.panorama.domain.book.service;



import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.book.client.LibraryClient;
import com.teambook.panorama.domain.book.client.NaverBookClient;
import com.teambook.panorama.domain.book.dto.internal.BookStatsDto;
import com.teambook.panorama.domain.book.dto.naver.NaverBookItem;
import com.teambook.panorama.domain.book.dto.naver.NaverBookResponse;
import com.teambook.panorama.domain.book.dto.popularBook.PopularBookDoc;
import com.teambook.panorama.domain.book.dto.popularBook.PopularBookDocWrapper;
import com.teambook.panorama.domain.book.dto.popularBook.PopularBookResponse;
import com.teambook.panorama.domain.book.dto.popularBook.PopularBookResponseWrapper;
import com.teambook.panorama.domain.book.dto.search.BookSearchItem;
import com.teambook.panorama.domain.book.dto.search.BookSearchResponse;
import com.teambook.panorama.domain.book.entity.Book;
import com.teambook.panorama.domain.book.entity.PopularBook;
import com.teambook.panorama.domain.book.mapper.BookStatsMapper;
import com.teambook.panorama.domain.book.repository.BookRepository;
import com.teambook.panorama.domain.book.repository.PopularBookRepository;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PopularBookService {

  private final LibraryClient libraryClient;
  private final BookRepository bookRepository;
  private final NaverBookClient naverBookClient;
  private final ReviewService reviewService;
  private final BookStatsMapper bookStatsMapper;
  private final PopularBookRepository popularBookRepository;

  public BookSearchResponse findPopularBooks() {
    List<PopularBook> popularBooks = popularBookRepository.findAllWithBook();
    List<String> isbns = popularBooks.stream().map(popularBook ->{
      return popularBook.getBook().getIsbn();
    }).toList();
    //북 스탯
    List<BookStatsDto> stats = bookStatsMapper.selectBookStatsByIsbns(isbns);
    //스탯 맵
    Map<String, BookStatsDto> statsMap = stats.stream().collect(Collectors.toMap(BookStatsDto::isbn, stat -> stat));
    //책 목록
    List<BookSearchItem> list =  popularBooks.stream().map(popular -> {
      Book book = popular.getBook();
      BookStatsDto stat = statsMap.get(book.getIsbn());
      return BookSearchItem.builder()
      .title(book.getTitle())
      .image(book.getImageUrl())
      .author(book.getAuthor())
      .isbn(book.getIsbn())
      .loanCount(popular.getLoanCount())
      .avgRating(stat != null ? stat.avgRating() : BigDecimal.ZERO)
      .ranking(popular.getRanking().toString())
      .build();
      }
    ).toList();
     return BookSearchResponse.builder()
        .display(10)
        .items(list)
        .start(1)
        .total(10)
        .build();
  }

  @Transactional
  public void syncPopularBooks() {
    LocalDate startDate = LocalDate.now().minusMonths(2);
    PopularBookResponseWrapper apiResponse = libraryClient.getPopularBooks(startDate);
    if (apiResponse == null || apiResponse.response() == null) {
      throw new BusinessException(ErrorCode.LIBRARY_API_ERROR);
    }
    PopularBookResponse bookResponse = apiResponse.response();
    if (bookResponse.resultNum() == null || bookResponse.docs() == null)
      throw new BusinessException(ErrorCode.LIBRARY_API_ERROR);

    // 책 isbn 리스트
    List<String> isbns = bookResponse.docs().stream().map(PopularBookDocWrapper::doc).map(doc -> {
      return doc.isbn();
    }).toList();
    List<PopularBookDoc> docs = bookResponse.docs().stream().map(PopularBookDocWrapper::doc).toList();
    Map<String, PopularBookDoc> docsMap = docs.stream().collect(Collectors.toMap(PopularBookDoc::isbn, doc -> doc));

    //책 목록
    List<Book> books = findOrCreateBooks(isbns);

    // 재동기화 시 ranking 중복 행이 쌓이지 않도록 기존 인기도서를 먼저 비운다.
    // (외부 API·네이버 조회가 모두 성공한 뒤에 삭제 → 실패 시 @Transactional 로 롤백)
    popularBookRepository.deleteAllInBatch();

    books.stream().forEach(book -> {
      String isbn = book.getIsbn();
      PopularBook popularBook = PopularBook.builder()
      .book(book)
      .loanCount(docsMap.get(isbn).loanCount())
      .ranking(Integer.parseInt(docsMap.get(isbn).ranking()))
      .build();
      popularBookRepository.save(popularBook);
    });
    

  }

  
  private List<Book> findOrCreateBooks(List<String> isbns) {
    return isbns.stream().map(isbn -> {
      return bookRepository.findByIsbn(isbn).orElseGet(() -> {
        try {
          NaverBookResponse response = naverBookClient.search(isbn, 1, 1, "sim");
          if (response.items().isEmpty())
            throw new BusinessException(ErrorCode.BOOK_NOT_FOUND);
          NaverBookItem naverBookItem = response.items().getFirst();
          return reviewService.saveBook(isbn, naverBookItem);
        } catch (DataIntegrityViolationException e) {
          return bookRepository.findByIsbn(isbn)
              .orElseThrow(() -> e);
        }
      });
    }).toList();

  }

}
