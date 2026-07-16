package com.teambook.panorama.domain.library.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 정보나루(data4library) libSrch 응답 매핑 DTO.
 *
 * <p>응답 구조 특이점(파싱 주의):
 * <ul>
 *   <li>{@code libs} 배열의 원소가 도서관 객체를 한 겹 더 감싼 {@code {"lib": {...}}} 형태다. → {@link LibItem}</li>
 *   <li>{@code BookCount} 만 대문자로 시작한다(나머지는 camelCase). → {@link Lib#bookCount()} 에 {@link JsonProperty}</li>
 *   <li>lib 하위 값은 전부 문자열로 온다. 숫자/좌표 변환·"-"→null 정규화는 동기화 서비스에서 처리한다.</li>
 * </ul>
 * 알 수 없는 필드(인증오류 응답 등)는 무시한다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record LibrarySearchResponse(
    Response response
) {

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record Response(
      int pageNo,
      int pageSize,
      int numFound,
      int resultNum,
      List<LibItem> libs
  ) {}

  /** libs 배열 원소 — 도서관 객체를 한 겹 감싼 래퍼. */
  @JsonIgnoreProperties(ignoreUnknown = true)
  public record LibItem(
      Lib lib
  ) {}

  /** 실제 도서관 정보. 모든 값이 String 으로 내려온다. */
  @JsonIgnoreProperties(ignoreUnknown = true)
  public record Lib(
      String libCode,
      String libName,
      String address,
      String tel,
      String fax,
      String latitude,
      String longitude,
      String homepage,
      String closed,
      String operatingTime,
      @JsonProperty("BookCount") String bookCount
  ) {}
}
