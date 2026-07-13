package com.teambook.panorama.domain.admin.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 사용자 목록 검색 요청. (관리자 목록은 POST + body 규약)
 */
@Schema(description = "사용자 목록 검색 요청. body 를 생략하면 필터 없이 1페이지를 조회한다.")
public record UserSearchRequest(

    // 키워드: 닉네임 / 로그인ID / 이메일
    @Schema(description = "검색 키워드 (닉네임 / 로그인 ID / 이메일)", example = "reader01")
    String searchString,

    // 상태 필터 (ACTIVE / SUSPENDED / DELETED)
    @Schema(description = "상태 필터", allowableValues = {"ACTIVE", "SUSPENDED", "DELETED"}, example = "ACTIVE")
    String status,

    // 권한 필터 (USER / ADMIN)
    @Schema(description = "권한 필터", allowableValues = {"USER", "ADMIN"}, example = "USER")
    String role,

    // 가입 경로 필터 (LOCAL / GOOGLE / NAVER / KAKAO)
    @Schema(description = "가입 경로 필터", allowableValues = {"LOCAL", "GOOGLE", "NAVER", "KAKAO"}, example = "LOCAL")
    String provider,

    // 페이지 번호 (1-based)
    @Schema(description = "페이지 번호 (1부터 시작). 생략하거나 1 미만이면 1 로 보정된다.", defaultValue = "1", example = "1")
    Integer page,

    // 페이지당 개수
    @Schema(description = "페이지당 개수. 생략하거나 1 미만이면 20 으로 보정된다.", defaultValue = "20", example = "20")
    Integer size
) {

  public UserSearchRequest {
    if (page == null || page < 1) {
      page = 1;
    }
    if (size == null || size < 1) {
      size = 20;
    }
  }

  /** body 없이 호출될 때 기본 검색(필터 없음, 1페이지). */
  public static UserSearchRequest ofDefaults() {
    return new UserSearchRequest(null, null, null, null, null, null);
  }
}
