package com.teambook.panorama.domain.book.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.teambook.panorama.domain.book.dto.library.LibBookAvailability;
import com.teambook.panorama.domain.book.dto.library.LibSrchResponse;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class LibraryClient {
  
  @Value("${library-bigdata.auth-key}")
  private String authKey;

  private final RestClient libraryRestClient;

  //도서 소장 도서관 조회
  public LibSrchResponse searchLib(String isbn, String regionCode) {
    return libraryRestClient.get()
    .uri("/libSrchByBook?authKey={a}&isbn={i}&region={r}", this.authKey, isbn, regionCode)
    .retrieve()
    .body(LibSrchResponse.class);
  }
  //해당 대출 가능 여부 파악
  public LibBookAvailability checkBookAvailability(String libCode, String isbn){
    return libraryRestClient.get()
    .uri("/bookExist?authKey={a}&libCode={l}&isbn={i}", this.authKey, libCode, isbn)
    .retrieve()
    .body(LibBookAvailability.class);
  }
  
}
