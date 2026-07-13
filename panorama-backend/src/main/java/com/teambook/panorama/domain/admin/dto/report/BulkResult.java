package com.teambook.panorama.domain.admin.dto.report;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 일괄 처리 결과. 실제로 처리된 건수와 이미 종결되어 건너뛴 건수를 나눠 반환한다.
 */
@Schema(description = "일괄 처리 결과. 실제 처리 건수와 이미 종결되어 건너뛴 건수를 나눠 반환한다.")
public record BulkResult(

    @Schema(description = "상태를 변경한 건수", example = "3")
    int done,      // 상태를 변경한 건수

    @Schema(description = "이미 종결(RESOLVED/REJECTED)이라 건너뛴 건수", example = "1")
    int skipped    // 이미 종결(RESOLVED/REJECTED)이라 건너뛴 건수
) {
}
