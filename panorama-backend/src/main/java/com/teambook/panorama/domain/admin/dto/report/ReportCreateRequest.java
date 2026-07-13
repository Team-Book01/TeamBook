package com.teambook.panorama.domain.admin.dto.report;

import com.teambook.panorama.domain.admin.entity.Report;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 신고 등록 요청. 게시글/댓글/리뷰의 신고 버튼에서 호출한다.
 *
 * <p>대상(targetType+targetId)은 버튼 컨텍스트에서 채워지고, reasonType 은 사유 선택값이다.
 * title 은 콘텐츠 신고에 의미가 없어 두지 않는다(V3에서 컬럼 제거). content 는 선택.</p>
 */
@Schema(description = "신고 등록 요청. 게시글/댓글/리뷰의 신고 버튼에서 호출한다.")
public record ReportCreateRequest(

    @Schema(description = "신고자 사용자 ID", example = "7")
    @NotNull(message = "신고자 ID는 필수입니다.")   // TODO: 인증 도입 후 로그인 사용자로 대체
    Long reporterUserId,

    @Schema(description = "신고 대상 유형", allowableValues = {"POST", "COMMENT", "REVIEW", "USER"}, example = "POST")
    @NotBlank(message = "신고 대상 유형은 필수입니다.")
    String targetType,

    @Schema(description = "신고 대상 원본 ID", example = "42")
    @NotNull(message = "신고 대상 ID는 필수입니다.")
    Long targetId,

    @Schema(description = "신고 사유 유형", allowableValues = {"ABUSE", "SPAM", "MISINFO", "OBSCENE", "ETC"}, example = "ABUSE")
    @NotBlank(message = "신고 사유 유형은 필수입니다.")
    String reasonType,

    @Schema(description = "신고 상세 내용 (선택, 최대 255자)", maxLength = 255, example = "댓글에 욕설이 포함되어 있습니다.")
    @Size(max = 255, message = "상세 내용은 255자 이하로 입력해주세요.")
    String content
) {

  public Report toEntity() {
    return Report.builder()
        .reporterUserId(reporterUserId)
        .targetType(targetType)
        .targetId(targetId)
        .reasonType(reasonType)
        .content(content)
        .build();
  }
}
