package com.teambook.panorama.domain.admin.dto.inquiry;

import java.util.ArrayList;
import java.util.List;

import com.teambook.panorama.domain.admin.entity.InquiryImage;
import com.teambook.panorama.domain.admin.entity.type.InquiryStatus;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "문의 요청 (등록/수정 공용)")
public record InquiryRequest(

    @Schema(description = "문의 ID. 등록 시에는 null", example = "1")
    Long inquiryId,

    /** 작성자 사용자 ID */
    @Schema(description = "작성자 사용자 ID", example = "7")
    Long userId,

    /** 문의 유형 */
    @Schema(description = "문의 유형", example = "결제")
    String category,

    /** 제목 */
    @Schema(description = "제목", example = "결제가 취소되지 않습니다")
    String title,

    /** 내용 */
    @Schema(description = "내용", example = "어제 결제한 건이 아직 취소 처리되지 않았습니다.")
    String content,

    /** 처리 상태 (PENDING, ANSWERED, CLOSED, DELETED) */
    @Schema(description = "처리 상태", example = "PENDING")
    InquiryStatus status,

    /** 첨부 이미지 목록 */
    @Schema(description = "첨부 이미지 목록. 생략하면 빈 배열로 보정된다.")
    List<InquiryImage> images

) {

  // record는 컴포넌트에 기본값(= new ArrayList<>())을 줄 수 없으므로
  // compact 생성자에서 null 이면 빈 리스트로 보정한다.
  public InquiryRequest {
    if (images == null) {
      images = new ArrayList<>();
    }
  }
}
