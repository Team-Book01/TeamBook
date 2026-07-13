package com.teambook.panorama.domain.admin.dto.report;

import com.teambook.panorama.domain.admin.entity.type.ContentAction;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 신고 처리(콘텐츠 조치) 요청.
 *
 * <p>처리 = 원본 콘텐츠에 조치(action) + 같은 대상의 미처리 신고 일괄 RESOLVE + 조치 로그.
 * 담당자(handlerUserId)는 인증 도입 후 로그인 관리자로 대체할 예정.</p>
 */
@Schema(description = "신고 처리(콘텐츠 조치) 요청. 원본에 조치를 취하고 같은 대상의 미처리 신고를 일괄 RESOLVED 로 바꾼다.")
public record ReportProcessRequest(

    @Schema(description = "원본 콘텐츠에 취할 조치. USER 대상이면 HIDDEN 은 SUSPENDED(제재)로 변환된다.", example = "HIDDEN")
    @NotNull(message = "콘텐츠 조치(action)는 필수입니다.")
    ContentAction action,

    @Schema(description = "처리 사유 (최대 500자)", maxLength = 500, example = "욕설 포함으로 숨김 처리")
    @Size(max = 500, message = "처리 사유는 500자 이하로 입력해주세요.")
    String reason,

    @Schema(description = "처리 담당 관리자 ID", example = "3")
    @NotNull(message = "처리 담당자 ID는 필수입니다.")
    Long handlerUserId
) {
}
