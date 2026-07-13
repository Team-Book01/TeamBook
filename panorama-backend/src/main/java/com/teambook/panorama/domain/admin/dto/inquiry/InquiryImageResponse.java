package com.teambook.panorama.domain.admin.dto.inquiry;

import java.time.LocalDateTime;

import com.teambook.panorama.domain.admin.entity.InquiryImage;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 문의 이미지 응답
 */
@Schema(description = "문의 첨부 이미지 응답")
public record InquiryImageResponse(

    @Schema(description = "문의 이미지 ID", example = "1")
    Long inquiryImageId,

    @Schema(description = "소속 문의 ID", example = "1")
    Long inquiryId,

    @Schema(description = "이미지 접근 URL", example = "https://cdn.panorama.com/inquiry/2026/07/abc123.png")
    String imageUrl,

    @Schema(description = "스토리지 객체 키", example = "inquiry/2026/07/abc123.png")
    String imageKey,

    @Schema(description = "업로드 당시 원본 파일명", example = "결제화면.png")
    String originalFileName,

    @Schema(description = "MIME 타입", example = "image/png")
    String contentType,

    @Schema(description = "파일 크기 (바이트)", example = "204800")
    Integer fileSize,

    @Schema(description = "노출 순서 (0부터)", example = "0")
    Integer sortOrder,

    @Schema(description = "업로드 일시", example = "2026-07-10T14:30:00")
    LocalDateTime createdAt
) {

  public static InquiryImageResponse from(InquiryImage image) {
    return new InquiryImageResponse(
        image.getInquiryImageId(),
        image.getInquiry() != null ? image.getInquiry().getInquiryId() : null,
        image.getImageUrl(),
        image.getImageKey(),
        image.getOriginalFileName(),
        image.getContentType(),
        image.getFileSize(),
        image.getSortOrder(),
        image.getCreatedAt()
    );
  }
}
