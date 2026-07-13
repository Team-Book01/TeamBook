package com.teambook.panorama.domain.admin.dto.notice;

import com.teambook.panorama.domain.admin.entity.Notice;
import com.teambook.panorama.domain.admin.entity.type.NoticeCategory;
import com.teambook.panorama.domain.admin.entity.type.NoticeStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 공지 등록 요청
 */
@Schema(description = "공지 등록 요청")
public record NoticeCreateRequest(

    @Schema(description = "작성자(관리자) ID", example = "3")
    @NotNull(message = "작성자 ID는 필수입니다.")
    Long userId,

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

    @Schema(description = "조회수 초기값", example = "0")
    Long viewCount,

    @Schema(description = "공지 상태", example = "ACTIVE")
    NoticeStatus status
) {

  public Notice toEntity() {
    return Notice.builder()
        .userId(userId)
        .category(category)
        .title(title)
        .content(content)
        .pinned(pinned)
        .important(important)
        .viewCount(viewCount)
        .status(status)
        .build();
  }
}
