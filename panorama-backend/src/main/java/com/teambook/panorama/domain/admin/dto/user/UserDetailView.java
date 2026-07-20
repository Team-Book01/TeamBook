package com.teambook.panorama.domain.admin.dto.user;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 사용자 상세 화면 응답. 프로필 + 관리자 조치 이력.
 *
 * <p>신고 상세(ReportDetailResponse)와 같은 합성 DTO 형태다. 서로 다른 테이블에서
 * 온 값이라 한 resultMap 으로 묶지 않고 서비스에서 조립한다.</p>
 */
@Schema(description = "사용자 상세 응답. 프로필과 관리자 조치 이력을 함께 내려준다.")
public record UserDetailView(

    @Schema(description = "사용자 프로필")
    UserDetailResponse user,

    @Schema(description = "이 사용자에 대한 관리자 조치 이력 (최신순). 없으면 빈 배열")
    List<AdminActionLogResponse> actionLogs
) {
}
