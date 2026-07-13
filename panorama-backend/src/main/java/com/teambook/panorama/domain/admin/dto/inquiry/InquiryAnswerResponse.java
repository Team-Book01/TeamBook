package com.teambook.panorama.domain.admin.dto.inquiry;

import java.time.LocalDateTime;

import com.teambook.panorama.domain.admin.entity.InquiryAnswer;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 문의 답변 응답
 */
@Schema(description = "문의 답변 응답")
public record InquiryAnswerResponse(

    @Schema(description = "답변 ID", example = "1")
    Long inquiryAnswerId,

    @Schema(description = "소속 문의 ID", example = "1")
    Long inquiryId,

    @Schema(description = "답변 작성 관리자 ID", example = "3")
    Long userId,

    @Schema(description = "답변 내용", example = "결제 취소는 영업일 기준 3일 내 처리됩니다.")
    String content,

    @Schema(description = "작성 일시", example = "2026-07-10T16:00:00")
    LocalDateTime createdAt,

    @Schema(description = "최종 수정 일시", example = "2026-07-10T16:00:00")
    LocalDateTime updatedAt
) {

  public static InquiryAnswerResponse from(InquiryAnswer answer) {
    return new InquiryAnswerResponse(
        answer.getInquiryAnswerId(),
        answer.getInquiry() != null ? answer.getInquiry().getInquiryId() : null,
        answer.getUserId(),
        answer.getContent(),
        answer.getCreatedAt(),
        answer.getUpdatedAt()
    );
  }
}
