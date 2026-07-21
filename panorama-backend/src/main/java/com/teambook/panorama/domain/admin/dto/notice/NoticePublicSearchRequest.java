package com.teambook.panorama.domain.admin.dto.notice;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 공지 목록 조회(공개) 요청. 관리자용 {@link NoticeSearchRequest}와 달리 status 파라미터가
 * 없다 — 공개 조회는 항상 ACTIVE 만 보여줘야 하므로, 클라이언트가 HIDDEN/DELETED 를
 * 요청할 수 있는 여지 자체를 없앤다(쿼리에도 하드코딩).
 */
@Schema(description = "공지 목록 조회(공개) 요청 (쿼리 파라미터)")
public record NoticePublicSearchRequest(

    @Schema(description = "공지 분류 필터", allowableValues = {"GENERAL", "EVENT", "UPDATE", "MAINTENANCE"}, example = "GENERAL")
    String category,

    @Schema(description = "페이지 번호 (1부터 시작). 생략하거나 1 미만이면 1 로 보정된다.", defaultValue = "1", example = "1")
    Integer page,

    @Schema(description = "페이지당 개수. 생략하거나 1 미만이면 20 으로 보정된다.", defaultValue = "20", example = "20")
    Integer size
) {

  public NoticePublicSearchRequest {
    if (page == null || page < 1) {
      page = 1;
    }
    if (size == null || size < 1) {
      size = 20;
    }
  }
}
