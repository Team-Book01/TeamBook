package com.teambook.panorama.domain.book.client;

import com.teambook.panorama.domain.auth.controller.EmailVerificationController;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.teambook.panorama.domain.book.dto.library.BookAvResponseWrapper;

import com.teambook.panorama.domain.book.dto.library.LibSrchResponseWrapper;
import com.teambook.panorama.domain.book.dto.popularBook.PopularBookResponseWrapper;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class LibraryClient {
  
  private final EmailVerificationController emailVerificationController;

  @Value("${library-bigdata.auth-key}")
  private String authKey;

  private final RestClient libraryRestClient;

  //도서 소장 도서관 조회
  public LibSrchResponseWrapper searchLib(String isbn, String regionCode, String dtlRegion, Integer pageNo, Integer pageSize) {
    try {
      return libraryRestClient.get()
    .uri(uriBuilder -> uriBuilder
      .path("/libSrchByBook")
      .queryParam("authKey", this.authKey)
      .queryParam("isbn", isbn)
      .queryParam("region", regionCode)
      .queryParamIfPresent("dtl_region", Optional.ofNullable(dtlRegion))
      .queryParam("pageNo", Optional.ofNullable(pageNo))
      .queryParam("pageSize", Optional.ofNullable(pageSize))
      .queryParam("format", "json")
      .build())
    .retrieve()
    .body(LibSrchResponseWrapper.class);
    } catch (RestClientException e) {
      throw new BusinessException(ErrorCode.LIBRARY_API_ERROR);
    }

  }
  //해당 대출 가능 여부 파악
  // 파라미터명은 isbn 이 아니라 isbn13 이다(isbn 으로 보내면 isbnLengthErr).
  public BookAvResponseWrapper checkBookAvailability(String libCode, String isbn){
    try {
      return libraryRestClient.get()
    .uri("/bookExist?authKey={a}&libCode={l}&isbn13={i}&format=json", this.authKey, libCode, isbn)
    .retrieve()
    .body(BookAvResponseWrapper.class);
    } catch (RestClientException e) {
      return null;
    }

  }

  //인기 대출 도서
  public PopularBookResponseWrapper getPopularBooks(LocalDate startDate) {
    try {
      return libraryRestClient.get()
      .uri("/loanItemSrch?authKey={a}&startDt={s}&pageNo=1&pageSize=10&format=json", this.authKey, startDate.toString())
      .retrieve()
      .body(PopularBookResponseWrapper.class);
    } catch (RestClientException e) {
      throw new BusinessException(ErrorCode.LIBRARY_API_ERROR);
    }

  }
  
}
