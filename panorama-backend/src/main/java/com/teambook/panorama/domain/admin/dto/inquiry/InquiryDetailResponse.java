package com.teambook.panorama.domain.admin.dto.inquiry;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 문의 상세 응답. 문의(이미지 포함) + 답변 목록을 합쳐 만든다.
 */
@Schema(description = "문의 상세 응답. 문의(이미지 포함) + 답변 목록.")
public record InquiryDetailResponse(

    @Schema(description = "문의 본문 (첨부 이미지 포함)")
    InquiryResponse inquiry,

    @Schema(description = "답변 목록 (작성일 오름차순)")
    List<InquiryAnswerResponse> answers
) {
}
