package com.teambook.panorama.domain.admin.dto.notice;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 공지 목록 검색 요청.
 */
@Schema(description = "공지 목록 검색 요청 (쿼리 파라미터)")
public record NoticeSearchRequest(

    // 키워드: 제목 / 내용
    @Schema(description = "검색 키워드 (제목 / 내용)", example = "점검")
    String searchString,

    // 공지 분류 (GENERAL / EVENT / UPDATE / MAINTENANCE ...)
    @Schema(description = "공지 분류 필터", allowableValues = {"GENERAL", "EVENT", "UPDATE", "MAINTENANCE"}, example = "GENERAL")
    String category,

    // 상태 (ACTIVE / DELETED)
    @Schema(description = "상태 필터", allowableValues = {"ACTIVE", "DELETED"}, example = "ACTIVE")
    String status,

    // 페이지 번호 (1-based)
    @Schema(description = "페이지 번호 (1부터 시작). 생략하거나 1 미만이면 1 로 보정된다.", defaultValue = "1", example = "1")
    Integer page,

    // 페이지당 개수
    @Schema(description = "페이지당 개수. 생략하거나 1 미만이면 20 으로 보정된다.", defaultValue = "20", example = "20")
    Integer size
) {

  public NoticeSearchRequest {
    if (page == null || page < 1) {
      page = 1;
    }
    if (size == null || size < 1) {
      size = 20;
    }
  }

  public static NoticeSearchRequest ofDefaults() {
    return new NoticeSearchRequest(null, null, null, null, null);
  }
}
