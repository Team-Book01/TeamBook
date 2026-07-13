package com.teambook.panorama.domain.admin.dto.inquiry;

import com.teambook.panorama.domain.admin.entity.type.InquiryStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/**
 * 문의 상태 변경 요청 (CLOSED 종료, 재개 등).
 */
@Schema(description = "문의 상태 변경 요청 (CLOSED 종료, 재개 등)")
public record InquiryStatusUpdateRequest(

    @Schema(description = "변경할 문의 상태", example = "CLOSED")
    @NotNull(message = "변경할 상태는 필수입니다.")
    InquiryStatus status
) {
}
