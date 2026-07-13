package com.teambook.panorama.domain.admin.dto.inquiry;

import java.time.LocalDateTime;

import com.teambook.panorama.domain.admin.entity.type.InquiryStatus;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "문의 목록 검색 요청. body 를 생략하면 기본 검색(필터 없음, 1페이지)으로 조회한다.")
public record InquirySearchRequest (

    // 키워드: 제목 / 내용
    @Schema(description = "검색 키워드 (제목 / 내용)", example = "결제")
    String searchString,

    // 문의 분류 (inquiries.category)
    @Schema(description = "문의 분류 필터", example = "결제")
    String category,

    // 처리 상태 (PENDING, ANSWERED, CLOSED, DELETED)
    @Schema(description = "처리 상태 필터", example = "PENDING")
    InquiryStatus status,

    // 작성자 ID (inquiries.user_id)
    @Schema(description = "작성자 사용자 ID", example = "7")
    Long userId,

    // 검색 시작일자 (created_at 기준)
    @Schema(description = "검색 시작 일시 (작성일 기준)", example = "2026-01-01T00:00:00")
    LocalDateTime startAt,

    // 검색 종료일자 (created_at 기준)
    @Schema(description = "검색 종료 일시 (작성일 기준)", example = "2026-12-31T23:59:59")
    LocalDateTime endAt,

    // 페이지 번호 (1-based)
    @Schema(description = "페이지 번호 (1부터 시작). 생략하거나 1 미만이면 1 로 보정된다.", defaultValue = "1", example = "1")
    Integer page,

    // 페이지당 개수
    @Schema(description = "페이지당 개수. 생략하거나 1 미만이면 20 으로 보정된다.", defaultValue = "20", example = "20")
    Integer size

) {

  // 페이징 파라미터가 없거나 비정상이면 기본값으로 보정한다.
  public InquirySearchRequest {
    if (page == null || page < 1) {
      page = 1;
    }
    if (size == null || size < 1) {
      size = 20;
    }
  }

  /** 요청 body 가 없을 때 쓰는 기본 검색(필터 없음 = 전체 목록 1페이지). */
  public static InquirySearchRequest ofDefaults() {
    return new InquirySearchRequest(null, null, null, null, null, null, null, null);
  }
}
