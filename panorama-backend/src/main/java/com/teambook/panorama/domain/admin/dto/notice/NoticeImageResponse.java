package com.teambook.panorama.domain.admin.dto.notice;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 공지 이미지 업로드 응답. 에디터가 본문에 삽입할 URL 과, 나중에 원본을 다루기 위한 키.
 */
@Schema(description = "공지 이미지 업로드 응답")
public record NoticeImageResponse(

    @Schema(description = "스토리지 객체 키", example = "8f1c2d3e-....png")
    String imageKey,

    @Schema(description = "본문에 삽입할 이미지 URL", example = "/images/8f1c2d3e-....png")
    String imageUrl
) {
}
