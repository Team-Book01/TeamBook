package com.teambook.panorama.domain.inquiry.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 사용자 문의 등록 요청. 작성자는 body가 아니라 인증 주체(JWT)에서 가져온다.
 *
 * <p>첨부 이미지는 이 DTO에 담지 않는다 — 컨트롤러가 별도 멀티파트 파트("images")로
 * 받아 서비스에 그대로 넘긴다. inquiry_images.inquiry_id 가 NOT NULL 이라(post_images와
 * 달리 소유자 없는 임시 업로드를 허용하지 않는다) 본문과 파일을 한 요청에서 함께 저장한다.</p>
 */
public record InquirySubmitRequestDto(
    @NotBlank(message = "문의 유형은 필수입니다.")
    @Size(max = 30, message = "문의 유형은 30자 이하로 입력해주세요.")
    String category,

    @NotBlank(message = "제목은 필수입니다.")
    @Size(max = 255, message = "제목은 255자 이하로 입력해주세요.")
    String title,

    @NotBlank(message = "내용은 필수입니다.")
    String content
) {
}
