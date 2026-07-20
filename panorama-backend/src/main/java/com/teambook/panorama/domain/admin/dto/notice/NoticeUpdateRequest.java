package com.teambook.panorama.domain.admin.dto.notice;

import com.teambook.panorama.domain.admin.entity.type.NoticeCategory;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 공지 수정 요청
 */
@Schema(description = "공지 수정 요청")
public record NoticeUpdateRequest(

    @Schema(description = "공지 분류", example = "GENERAL")
    @NotNull(message = "공지 분류는 필수입니다.")
    NoticeCategory category,

    @Schema(description = "제목 (최대 255자)", maxLength = 255, example = "서비스 점검 안내")
    @NotBlank(message = "제목은 필수입니다.")
    @Size(max = 255, message = "제목은 255자 이하로 입력해주세요.")
    String title,

    @Schema(description = "내용", example = "7월 15일 02:00~04:00 서비스 점검이 진행됩니다.")
    @NotBlank(message = "내용은 필수입니다.")
    String content,

    @Schema(description = "상단 고정 여부", example = "false")
    boolean pinned,

    @Schema(description = "중요 공지 여부", example = "false")
    boolean important,

    // 이번 수정에서 새로 올린 이미지들만 담는다. 기존에 이미 연결된 이미지는 보낼 필요가 없다.
    @Schema(description = "이번 수정에서 새로 추가된 이미지 키 목록")
    List<String> imageKeys

    // @Schema(description = "게시 여부", example = "true")
    // boolean published
) {
}
