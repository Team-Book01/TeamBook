package com.teambook.panorama.domain.admin.dto.inquiry;

import java.time.LocalDateTime;
import java.util.List;

import com.teambook.panorama.domain.admin.entity.Inquiry;
import com.teambook.panorama.domain.admin.entity.type.InquiryStatus;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 문의 응답
 */
@Schema(description = "문의 응답 (첨부 이미지 포함)")
public record InquiryResponse(

    @Schema(description = "문의 ID", example = "1")
    Long inquiryId,

    @Schema(description = "작성자 사용자 ID", example = "7")
    Long userId,

    @Schema(description = "문의 유형", example = "결제")
    String category,

    @Schema(description = "제목", example = "결제가 취소되지 않습니다")
    String title,

    @Schema(description = "내용", example = "어제 결제한 건이 아직 취소 처리되지 않았습니다.")
    String content,

    @Schema(description = "처리 상태", example = "PENDING")
    InquiryStatus status,

    @Schema(description = "첨부 이미지 목록")
    List<InquiryImageResponse> images,

    @Schema(description = "작성 일시", example = "2026-07-10T14:30:00")
    LocalDateTime createdAt,

    @Schema(description = "최종 수정 일시", example = "2026-07-10T16:00:00")
    LocalDateTime updatedAt
) {

  public static InquiryResponse from(Inquiry inquiry) {
    List<InquiryImageResponse> images = inquiry.getImages().stream()
        .map(InquiryImageResponse::from)
        .toList();

    return new InquiryResponse(
        inquiry.getInquiryId(),
        inquiry.getUserId(),
        inquiry.getCategory(),
        inquiry.getTitle(),
        inquiry.getContent(),
        inquiry.getStatus(),
        images,
        inquiry.getCreatedAt(),
        inquiry.getUpdatedAt()
    );
  }
}
