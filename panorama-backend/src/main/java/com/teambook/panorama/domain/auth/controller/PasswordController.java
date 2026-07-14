package com.teambook.panorama.domain.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.auth.dto.PasswordDto;
import com.teambook.panorama.domain.auth.service.PasswordService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Password", description = "비밀번호 재설정 API (이메일 토큰 기반, 비로그인)")
@RestController
@RequestMapping("/api/v1/auth/password")
@RequiredArgsConstructor
public class PasswordController {

    private final PasswordService passwordService;

    @Operation(
            summary = "비밀번호 재설정 메일 발송 요청",
            description = "가입 시 등록한 이메일로 재설정 토큰(링크)을 발송한다. "
                    + "이메일 열거 방지를 위해 존재하지 않는 이메일이어도 성공(202)으로 응답한다. Local 계정만 대상. "
                    + "※ SMTP 미설정으로 현재 로직은 미구현(확장 예정).")
    @ApiResponses({
            @ApiResponse(responseCode = "202", description = "재설정 메일 발송 접수 (본문 없음)"),
            @ApiResponse(responseCode = "400", description = "입력값 검증 실패 (C001)")
    })
    @PostMapping("/reset-request")
    public ResponseEntity<Void> requestReset(@RequestBody @Valid PasswordDto.ResetRequest request) {
        passwordService.requestReset(request.email());
        return ResponseEntity.accepted().build();
    }

    @Operation(
            summary = "비밀번호 재설정 확정",
            description = "재설정 메일로 받은 토큰과 새 비밀번호로 비밀번호를 변경한다. "
                    + "※ SMTP 미설정으로 현재 로직은 미구현(확장 예정).")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "재설정 성공 (본문 없음)"),
            @ApiResponse(responseCode = "400", description = "입력값 검증 실패 (C001) · 유효하지 않거나 만료된 토큰 (A008)")
    })
    @PostMapping("/reset")
    public ResponseEntity<Void> confirmReset(@RequestBody @Valid PasswordDto.ResetConfirm request) {
        passwordService.confirmReset(request.token(), request.newPassword());
        return ResponseEntity.noContent().build();
    }
}
