package com.teambook.panorama.domain.admin.dto.user;

import com.teambook.panorama.domain.admin.entity.type.UserAction;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 사용자 제재(처리) 요청. status 변경 + 조치 로그.
 */
@Schema(description = "사용자 제재(처리) 요청. status 를 변경하고 조치 로그를 남긴다.")
public record UserProcessRequest(

    @Schema(description = "사용자에게 취할 조치. SUSPEND→SUSPENDED, ACTIVATE→ACTIVE, DELETE→DELETED 로 매핑된다.",
        example = "SUSPEND")
    @NotNull(message = "조치(action)는 필수입니다.")
    UserAction action,

    @Schema(description = "처리 사유 (최대 500자)", maxLength = 500, example = "반복적인 욕설로 7일 정지")
    @Size(max = 500, message = "처리 사유는 500자 이하로 입력해주세요.")
    String reason,

    @Schema(description = "처리 담당 관리자 ID", example = "3")
    @NotNull(message = "처리 담당자 ID는 필수입니다.")   // TODO: 인증 도입 후 principal 로 대체
    Long handlerUserId
) {
}
