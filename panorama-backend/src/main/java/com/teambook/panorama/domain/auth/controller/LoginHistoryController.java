package com.teambook.panorama.domain.auth.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.auth.dto.LoginHistoryDto;
import com.teambook.panorama.domain.auth.service.LoginHistoryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "LoginHistory", description = "내 로그인 이력 조회 API")
@RestController
@RequestMapping("/api/v1/users/me/login-histories")
@RequiredArgsConstructor
public class LoginHistoryController {

    private final LoginHistoryService loginHistoryService;

    @Operation(
            summary = "내 로그인 이력 조회",
            description = "인증된 본인의 로그인 이력을 최신순으로 조회한다.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 요청")
    })
    @GetMapping
    public ResponseEntity<List<LoginHistoryDto.Response>> getMyLoginHistories(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(loginHistoryService.getMyHistories(userId));
    }
}