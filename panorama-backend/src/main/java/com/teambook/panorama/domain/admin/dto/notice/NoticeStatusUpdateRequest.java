package com.teambook.panorama.domain.admin.dto.notice;

import com.teambook.panorama.domain.admin.entity.type.NoticeStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/**
 * 공지 상태 변경 요청 (ACTIVE 게시 / HIDDEN 숨김 / DELETED 삭제).
 */
@Schema(description = "공지 상태 변경 요청 (ACTIVE 게시 / HIDDEN 숨김 / DELETED 삭제)")
public record NoticeStatusUpdateRequest(

    @Schema(description = "변경할 공지 상태", example = "HIDDEN")
    @NotNull(message = "변경할 상태는 필수입니다.")
    NoticeStatus status
) {
}
