package com.teambook.panorama.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * 이메일 등록·인증 요청 DTO.
 */
public class EmailVerificationDto {

    @Schema(name = "EmailRegisterRequest", description = "이메일 등록·인증 요청 (인증 메일 발송)")
    public record RegisterRequest(
            @Schema(description = "인증할 이메일", example = "user@example.com")
            @NotBlank
            @Email
            String email
    ) {}

    @Schema(name = "EmailVerifyConfirmRequest", description = "이메일 인증 콜백 (메일 링크의 토큰)")
    public record ConfirmRequest(
            @Schema(description = "메일 링크로 받은 인증 토큰(원문)")
            @NotBlank
            String token
    ) {}
}
