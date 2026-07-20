package com.teambook.panorama.domain.admin.dto.report;

import java.time.LocalDateTime;

import com.teambook.panorama.domain.admin.entity.type.ReportStatus;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "신고 목록 검색 요청. body 를 생략하면 미처리 목록 1페이지로 조회한다.")
public record ReportSearchRequest (

    // 검색 (신고상세 - content, 신고자 닉네임?? )
    @Schema(description = "검색 키워드 (신고 상세 내용, 신고자 닉네임)", example = "욕설")
    String searchString,

    // 신고 대상 유형 (게시글-Post, 댓글-Comment, 사용자-User)
    @Schema(description = "신고 대상 유형", allowableValues = {"POST", "COMMENT", "REVIEW", "USER"}, example = "POST")
    String targetType,

    // 신고 사유 유형 (욕설/비방, 허위정보, 스팸 등)
    @Schema(description = "신고 사유 유형", allowableValues = {"ABUSE", "SPAM", "MISINFO", "OBSCENE", "ETC"}, example = "ABUSE")
    String reasonType,

    // 처리 상태 (PENDING, RESOLVED, REJECTED) — 특정 상태로 콕 집어 필터. 지정 시 includeAll보다 우선.
    @Schema(description = "처리 상태로 콕 집어 필터. 지정하면 includeAll 보다 우선한다.", example = "PENDING")
    ReportStatus status,

    // 전체 보기. false(기본)면 미처리(PENDING)만, true면 완료 건까지 모두. (status 미지정일 때만 적용)
    @Schema(description = "전체 보기 여부. false(기본)면 미처리(PENDING)만, true 면 완료 건까지 모두. status 미지정일 때만 적용된다.",
        defaultValue = "false", example = "false")
    Boolean includeAll,

    // 신고자 ID
    @Schema(description = "신고자 사용자 ID", example = "1")
    Long reporterUserId,

    // 검색 시작일자
    @Schema(description = "검색 시작 일시 (신고 생성일 기준)", example = "2026-01-01T00:00:00")
    LocalDateTime startAt,

    // 검색 종료일자
    @Schema(description = "검색 종료 일시 (신고 생성일 기준)", example = "2026-12-31T23:59:59")
    LocalDateTime endAt,

    // 페이지 번호 (1-based)
    @Schema(description = "페이지 번호 (1부터 시작). 생략하거나 1 미만이면 1 로 보정된다.", defaultValue = "1", example = "1")
    Integer page,

    // 페이지당 개수
    @Schema(description = "페이지당 개수. 생략하거나 1 미만이면 20 으로 보정된다.", defaultValue = "20", example = "20")
    Integer size

) {

  // 페이징 파라미터가 없거나 비정상이면 기본값으로 보정한다.
  public ReportSearchRequest {
    if (page == null || page < 1) {
      page = 1;
    }
    if (size == null || size < 1) {
      size = 20;
    }
  }

  /** 요청 body 가 없을 때 쓰는 기본 검색(필터 없음 = 미처리 목록 1페이지). */
  public static ReportSearchRequest ofDefaults() {
    return new ReportSearchRequest(null, null, null, null, null, null, null, null, null, null);
  }
}
