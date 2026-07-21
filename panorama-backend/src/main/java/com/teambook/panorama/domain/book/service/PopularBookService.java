package com.teambook.panorama.domain.book.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.teambook.panorama.domain.book.client.LibraryClient;
import com.teambook.panorama.domain.book.dto.popularBook.PopularBookDocWrapper;
import com.teambook.panorama.domain.book.dto.popularBook.PopularBookResponse;
import com.teambook.panorama.domain.book.dto.popularBook.PopularBookResponseWrapper;
import com.teambook.panorama.domain.book.dto.search.BookSearchItem;
import com.teambook.panorama.domain.book.dto.search.BookSearchResponse;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PopularBookService {
  private final LibraryClient libraryClient;

  public BookSearchResponse findPopularBooks() {
    LocalDate startDate = LocalDate.now().minusMonths(2) ;
    PopularBookResponseWrapper apiResponse = libraryClient.getPopularBooks(startDate);
    if (apiResponse == null || apiResponse.response() == null) {
      throw new BusinessException(ErrorCode.LIBRARY_API_ERROR);
    }
    PopularBookResponse bookResponse = apiResponse.response();
    if (bookResponse.resultNum() == null || bookResponse.docs() == null) throw new BusinessException(ErrorCode.LIBRARY_API_ERROR);
    //책리스트
    List<BookSearchItem> list = bookResponse.docs().stream().map(PopularBookDocWrapper::doc).map(doc -> {
      return 
      BookSearchItem.builder()
      .author(doc.authors())
      .image(doc.bookImageUrl())
      .isbn(doc.isbn())
      .publisher(doc.publisher())
      .title(doc.title())
      .ranking(doc.ranking())
      .loanCount(doc.loanCount())
      .build();
    }).toList();
    return BookSearchResponse.builder()
    .display(10)
    .items(list)
    .start(1)
    .total(bookResponse.resultNum())
    .build();
  }
}
