package com.teambook.panorama.domain.report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** 사용자 신고 등록 요청. 신고자는 body가 아니라 인증 주체(JWT)에서. */
public record ReportSubmitRequestDto(
    @NotBlank String targetType,
    @NotNull Long targetId,
    @NotBlank String reasonType,
    @Size(max = 255) String content
) {
}