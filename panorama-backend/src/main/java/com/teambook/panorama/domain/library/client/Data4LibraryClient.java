package com.teambook.panorama.domain.library.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.teambook.panorama.domain.library.dto.LibrarySearchResponse;

/**
 * 정보나루(data4library) libSrch API 호출 클라이언트.
 * 인증키는 절대 하드코딩하지 않고 application.yml + 환경변수로 주입받는다.
 */
@Component
public class Data4LibraryClient {

  private final RestClient data4LibraryRestClient;

  @Value("${data4library.auth-key}")
  private String authKey;

  public Data4LibraryClient(RestClient data4LibraryRestClient) {
    this.data4LibraryRestClient = data4LibraryRestClient;
  }

  /**
   * 도서관 목록을 페이지 단위로 조회한다.
   *
   * @param pageNo   1부터 시작하는 페이지 번호
   * @param pageSize 페이지당 건수
   */
  public LibrarySearchResponse searchLibraries(int pageNo, int pageSize) {
    return data4LibraryRestClient.get()
        .uri("/api/libSrch?authKey={key}&pageNo={no}&pageSize={size}&format=json",
            authKey, pageNo, pageSize)
        .retrieve()
        .body(LibrarySearchResponse.class);
  }
}
