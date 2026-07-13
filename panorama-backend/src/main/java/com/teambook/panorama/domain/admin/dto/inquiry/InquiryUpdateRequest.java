package com.teambook.panorama.domain.admin.dto.inquiry;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 문의 수정 요청
 */
@Schema(description = "문의 수정 요청")
public record InquiryUpdateRequest(

    @Schema(description = "문의 유형", example = "결제")
    @NotBlank(message = "문의 유형은 필수입니다.")
    String category,

    @Schema(description = "제목 (최대 255자)", maxLength = 255, example = "결제가 취소되지 않습니다")
    @NotBlank(message = "제목은 필수입니다.")
    @Size(max = 255, message = "제목은 255자 이하로 입력해주세요.")
    String title,

    @Schema(description = "내용", example = "어제 결제한 건이 아직 취소 처리되지 않았습니다.")
    @NotBlank(message = "내용은 필수입니다.")
    String content
) {
}
