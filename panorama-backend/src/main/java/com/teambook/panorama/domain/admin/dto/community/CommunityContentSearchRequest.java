package com.teambook.panorama.domain.admin.dto.community;

import java.util.Locale;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 커뮤니티 콘텐츠 관리 검색 요청. 콘텐츠 타입 하나(POST/COMMENT/REVIEW)를 골라 조회한다.
 */
@Schema(description = "커뮤니티 콘텐츠 관리 검색 요청. 콘텐츠 타입 하나를 골라 조회한다. body 를 생략하면 POST 기본 조회.")
public record CommunityContentSearchRequest(

    // 콘텐츠 타입 (POST / COMMENT / REVIEW) — 미지정 시 POST
    @Schema(description = "조회할 콘텐츠 타입. 생략하거나 비어 있으면 POST 로 보정되며, 소문자로 보내도 대문자로 변환된다.",
        allowableValues = {"POST", "COMMENT", "REVIEW"}, defaultValue = "POST", example = "POST")
    String contentType,

    // 상태 필터 (ACTIVE / HIDDEN / DELETED)
    @Schema(description = "상태 필터", allowableValues = {"ACTIVE", "HIDDEN", "DELETED"}, example = "ACTIVE")
    String status,

    // 키워드: 내용 / 작성자 닉네임 (POST 는 제목도)
    @Schema(description = "검색 키워드 (내용 / 작성자 닉네임, POST 는 제목도 포함)", example = "스포일러")
    String searchString,

    @Schema(description = "페이지 번호 (1부터 시작). 생략하거나 1 미만이면 1 로 보정된다.", defaultValue = "1", example = "1")
    Integer page,

    @Schema(description = "페이지당 개수. 생략하거나 1 미만이면 20 으로 보정된다.", defaultValue = "20", example = "20")
    Integer size
) {

  public CommunityContentSearchRequest {
    contentType = (contentType == null || contentType.isBlank())
        ? "POST" : contentType.toUpperCase(Locale.ROOT);
    if (page == null || page < 1) {
      page = 1;
    }
    if (size == null || size < 1) {
      size = 20;
    }
  }

  public static CommunityContentSearchRequest ofDefaults() {
    return new CommunityContentSearchRequest(null, null, null, null, null);
  }
}
