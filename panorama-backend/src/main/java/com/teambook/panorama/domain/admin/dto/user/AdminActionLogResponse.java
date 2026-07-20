package com.teambook.panorama.domain.admin.dto.user;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 관리자 조치 이력 1건. admin_action_log 를 그대로 읽는다.
 *
 * <p>이 테이블은 그동안 INSERT 만 있고 읽는 곳이 없어, 관리자가 적은 사유가 어디서도
 * 다시 보이지 않았다. 사용자는 정지·해제가 반복될 수 있어 마지막 사유만으로는 판단이
 * 어렵고(세 번째 정지와 첫 정지는 다른 상황이다), 조치 1건이 사용자 1명에 대응해
 * target_id 로 그대로 조회된다. 그래서 신고처럼 별도 컬럼을 두지 않고 로그를 읽는다.</p>
 */
@Schema(description = "관리자 조치 이력 1건")
public record AdminActionLogResponse(

    @Schema(description = "조치 종류 (SUSPEND / ACTIVATE / DELETE)", example = "SUSPEND")
    String actionType,

    @Schema(description = "관리자가 남긴 사유. 입력하지 않았으면 null", example = "욕설 신고 누적")
    String reason,

    @Schema(description = "조치한 관리자 닉네임", example = "운영자01")
    String handlerNickname,

    @Schema(description = "조치 일시", example = "2026-07-10T16:00:00")
    LocalDateTime createdAt
) {
}
