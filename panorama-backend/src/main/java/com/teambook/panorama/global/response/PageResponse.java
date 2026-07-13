package com.teambook.panorama.global.response;

import java.util.List;

/**
 * 목록(페이지) 응답 공통 형태.
 *
 * <p>모든 목록 API는 이 타입으로 감싸 반환한다. (page는 1부터 시작)</p>
 */
public record PageResponse<T>(
    List<T> content,      // 현재 페이지 데이터
    int page,             // 현재 페이지 번호 (1-based)
    int size,             // 페이지당 개수
    long totalElements,   // 전체 건수
    int totalPages,       // 전체 페이지 수
    boolean last          // 마지막 페이지 여부
) {

  public static <T> PageResponse<T> of(List<T> content, int page, int size, long totalElements) {
    int totalPages = size > 0 ? (int) Math.ceil((double) totalElements / size) : 0;
    boolean last = page >= totalPages;
    return new PageResponse<>(content, page, size, totalElements, totalPages, last);
  }
}
