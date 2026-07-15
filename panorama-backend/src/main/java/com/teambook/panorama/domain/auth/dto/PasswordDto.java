package com.teambook.panorama.domain.auth.dto;

import com.teambook.panorama.global.constant.ValidationPattern;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 비밀번호 재설정/변경 요청 DTO.
 * <ul>
 *   <li>이메일 토큰 기반 재설정(비로그인): {@link ResetRequest} → {@link ResetConfirm}</li>
 *   <li>로그인 상태 변경(현재 비밀번호 확인): {@link ChangeRequest}</li>
 * </ul>
 */
public class PasswordDto {

    @Schema(name = "PasswordResetRequest", description = "비밀번호 재설정 메일 발송 요청 (비로그인)")
    public record ResetRequest(
            @Schema(description = "가입 시 등록한 이메일", example = "test@example.com")
            @NotBlank
            @Email
            String email
    ) {}

    @Schema(name = "PasswordResetConfirm", description = "비밀번호 재설정 확정 (메일로 받은 토큰 + 새 비밀번호)")
    public record ResetConfirm(
            @Schema(description = "재설정 메일로 발급된 토큰", example = "9f3c1a7e-2b8d-4e10-a6f2-7c9d0e5b1234")
            @NotBlank
            String token,

            @Schema(description = "새 비밀번호 (8~15자, 대소문자·특수문자 포함)", example = "New1234!")
            @NotBlank
            @Size(min = ValidationPattern.PASSWORD_MIN, max = ValidationPattern.PASSWORD_MAX)
            @Pattern(regexp = ValidationPattern.PASSWORD, message = ValidationPattern.PASSWORD_MESSAGE)
            String newPassword
    ) {}

    @Schema(name = "PasswordChangeRequest", description = "로그인 상태에서 비밀번호 변경 (현재 비밀번호 확인)")
    public record ChangeRequest(
            @Schema(description = "현재 비밀번호", example = "Old1234!")
            @NotBlank
            String currentPassword,

            @Schema(description = "새 비밀번호 (8~15자, 대소문자·특수문자 포함)", example = "New1234!")
            @NotBlank
            @Size(min = ValidationPattern.PASSWORD_MIN, max = ValidationPattern.PASSWORD_MAX)
            @Pattern(regexp = ValidationPattern.PASSWORD, message = ValidationPattern.PASSWORD_MESSAGE)
            String newPassword
    ) {}
}
