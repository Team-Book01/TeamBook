package com.teambook.panorama.domain.book.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.teambook.panorama.domain.book.dto.library.LibBookAvailability;
import com.teambook.panorama.domain.book.dto.library.LibSrchResponse;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class LibraryClient {
  
  @Value("${library-bigdata.auth-key}")
  private String authKey;

  private final RestClient libraryRestClient;

  //도서 소장 도서관 조회
  public LibSrchResponse searchLib(String isbn, String regionCode) {
    try {
      return libraryRestClient.get()
    .uri("/libSrchByBook?authKey={a}&isbn={i}&region={r}", this.authKey, isbn, regionCode)
    .retrieve()
    .body(LibSrchResponse.class);  
    } catch (RestClientException e) {
      throw new BusinessException(ErrorCode.LIBRARY_API_ERROR);
    }
    
  }
  //해당 대출 가능 여부 파악
  public LibBookAvailability checkBookAvailability(String libCode, String isbn){
    try {
      return libraryRestClient.get()
    .uri("/bookExist?authKey={a}&libCode={l}&isbn={i}", this.authKey, libCode, isbn)
    .retrieve()
    .body(LibBookAvailability.class);  
    } catch (RestClientException e) {
      throw new BusinessException(ErrorCode.LIBRARY_API_ERROR);
    }
    
  }
  
}
