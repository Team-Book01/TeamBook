package com.teambook.panorama.domain.admin.dto.report;

import java.util.List;

import com.teambook.panorama.domain.admin.entity.type.ReportStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

/**
 * 신고 일괄 처리(상태 변경) 요청. 목록에서 체크박스로 여러 건을 선택해 한 번에 처리한다.
 * (단건은 {@link ReportProcessRequest} + PATCH /reports/{id}/process 사용)
 */
@Schema(description = "신고 일괄 처리(상태 변경) 요청. 목록에서 선택한 여러 건을 한 번에 처리한다.")
public record ReportBulkProcessRequest(

    @Schema(description = "처리할 신고 ID 목록 (1건 이상)", example = "[1, 2, 3]")
    @NotEmpty(message = "처리할 신고를 하나 이상 선택해야 합니다.")
    List<Long> reportIds,

    @Schema(description = "변경할 처리 상태", example = "RESOLVED")
    @NotNull(message = "처리 상태는 필수입니다.")
    ReportStatus status,

    @Schema(description = "처리 담당 관리자 ID", example = "3")
    @NotNull(message = "처리 담당자 ID는 필수입니다.")
    Long handlerUserId
) {
}
