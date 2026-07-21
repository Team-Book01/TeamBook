package com.teambook.panorama.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public class WithdrawDTO {
  @Schema(description = "회원 탈퇴 요청 (LOCAL은 password, 소셜은 confirmText)")
  public record WithdrawRequest(
          @Schema(description = "현재 비밀번호 (LOCAL 계정 전용)", example = "password123!")
          String password,

          @Schema(description = "탈퇴 확인 문구 (소셜 계정 전용, \"탈퇴합니다\" 입력)", example = "탈퇴합니다")
          String confirmText
  ) {
  }
}
