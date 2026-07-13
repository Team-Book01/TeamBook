package com.teambook.panorama.domain.admin.dto.community;

import com.teambook.panorama.domain.admin.entity.type.ContentAction;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 커뮤니티 콘텐츠 처리 요청 (숨김/삭제). status 변경 + 조치 로그.
 */
@Schema(description = "커뮤니티 콘텐츠 처리 요청 (숨김/삭제). status 를 변경하고 조치 로그를 남긴다.")
public record CommunityProcessRequest(

    @Schema(description = "콘텐츠에 취할 조치", example = "HIDDEN")
    @NotNull(message = "콘텐츠 조치(action)는 필수입니다.")
    ContentAction action,   // HIDDEN / DELETED

    @Schema(description = "처리 사유 (최대 500자)", maxLength = 500, example = "스포일러 포함으로 숨김 처리")
    @Size(max = 500, message = "처리 사유는 500자 이하로 입력해주세요.")
    String reason,

    @Schema(description = "처리 담당 관리자 ID", example = "3")
    @NotNull(message = "처리 담당자 ID는 필수입니다.")
    Long handlerUserId
) {
}
