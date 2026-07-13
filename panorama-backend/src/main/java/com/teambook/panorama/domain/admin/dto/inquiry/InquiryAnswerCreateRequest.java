package com.teambook.panorama.domain.admin.dto.inquiry;

import com.teambook.panorama.domain.admin.entity.Inquiry;
import com.teambook.panorama.domain.admin.entity.InquiryAnswer;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 문의 답변 등록 요청
 */
@Schema(description = "문의 답변 등록 요청. 등록 시 문의 상태가 ANSWERED 로 전환된다.")
public record InquiryAnswerCreateRequest(

    @Schema(description = "답변 작성 관리자 ID", example = "3")
    @NotNull(message = "답변 관리자 ID는 필수입니다.") Long userId,

    @Schema(description = "답변 내용", example = "결제 취소는 영업일 기준 3일 내 처리됩니다.")
    @NotBlank(message = "답변 내용은 필수입니다.") String content) {

  public InquiryAnswer toEntity(Inquiry inquiry) {
    return InquiryAnswer.builder()
        .inquiry(inquiry)
        .userId(userId)
        .content(content)
        .build();
  }
}
