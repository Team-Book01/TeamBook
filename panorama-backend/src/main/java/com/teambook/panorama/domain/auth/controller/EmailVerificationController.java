package com.teambook.panorama.domain.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.auth.dto.EmailVerificationDto;
import com.teambook.panorama.domain.auth.service.EmailVerificationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 이메일 등록·인증 API.
 * - 요청(등록)은 로그인 유저만 가능하므로 /users/me/** (인증 필요),
 *   콜백은 비로그인 상태로 메일 링크를 클릭할 수 있어야 하므로 /auth/** (permitAll)에 둔다.
 *   두 경로의 보안 범위가 달라, 클래스 레벨 @RequestMapping 없이 메서드마다 전체 경로를 지정한다.
 */
@Tag(name = "이메일 인증", description = "이메일 등록·인증 API (C)")
@RestController
@RequiredArgsConstructor
public class EmailVerificationController {

    private final EmailVerificationService emailVerificationService;

    @Operation(
            summary = "이메일 등록·인증 요청",
            description = "로그인 유저가 인증할 이메일을 등록하면 인증 메일(토큰 링크)을 발송한다. "
                    + "인증 완료 전까지 입력한 이메일은 users.email 에 저장되지 않는다(대기 상태로만 보관).")
    @ApiResponses({
            @ApiResponse(responseCode = "202", description = "인증 메일 발송 접수 (본문 없음)"),
            @ApiResponse(responseCode = "400", description = "입력값 검증 실패 (C001)"),
            @ApiResponse(responseCode = "409", description = "이미 사용 중인 이메일 (A010)")
    })
    @PostMapping("/api/v1/users/me/email")
    public ResponseEntity<Void> requestVerification(
            @AuthenticationPrincipal Long userId,
            @RequestBody @Valid EmailVerificationDto.RegisterRequest request) {
        emailVerificationService.requestVerification(userId, request.email());
        return ResponseEntity.accepted().build();
    }

    @Operation(
            summary = "이메일 인증 콜백",
            description = "메일 링크의 토큰을 검증하고 인증을 완료한다(users.email 승격). "
                    + "비로그인 상태로 링크를 클릭할 수 있어 permitAll(토큰으로 신원 특정).")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "인증 완료 (본문 없음)"),
            @ApiResponse(responseCode = "400", description = "유효하지 않은 인증 토큰 (A011)"),
            @ApiResponse(responseCode = "409", description = "이미 사용 중인 이메일 (A010)")
    })
    @PostMapping("/api/v1/auth/email/verify")
    public ResponseEntity<Void> confirmVerification(
            @RequestBody @Valid EmailVerificationDto.ConfirmRequest request) {
        emailVerificationService.confirmVerification(request.token());
        return ResponseEntity.noContent().build();
    }
}
