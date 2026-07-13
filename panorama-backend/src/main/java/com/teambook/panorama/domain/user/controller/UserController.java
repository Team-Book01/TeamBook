package com.teambook.panorama.domain.user.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.user.dto.SignUpDto;
import com.teambook.panorama.domain.user.dto.UserDto;
import com.teambook.panorama.domain.user.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "User", description = "회원가입 · 내 정보 조회 API")
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 로컬 회원가입.
     * 성공 시 201 Created + 생성된 리소스 위치(/api/v1/users/{id})를 Location 헤더로.
     */
    @Operation(
            summary = "로컬 회원가입",
            description = "loginId·password·nickname·email로 로컬 계정을 생성한다. "
                    + "성공 시 201 Created와 Location 헤더(/api/v1/users/{id})를 반환하며 본문은 없다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "회원가입 성공 (Location 헤더 반환, 본문 없음)"),
            @ApiResponse(responseCode = "400", description = "입력값 검증 실패 (C001)"),
            @ApiResponse(responseCode = "409", description = "아이디·닉네임·이메일 중복 (U002/U003/U004)")
    })
    @PostMapping
    public ResponseEntity<Void> signup(@RequestBody @Valid SignUpDto.Request request) {
        Long userId = userService.signupLocal(request);
        return ResponseEntity
                .created(java.net.URI.create("/api/v1/users/" + userId))
                .build();
    }

    /**
     * 내 정보 조회. JWT 인증을 통과한 사용자의 principal에서 userId를 꺼내 조회.
     */
    @Operation(
            summary = "내 정보 조회",
            description = "Authorization 헤더의 access 토큰으로 인증된 본인의 정보를 조회한다.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 요청"),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 회원 (U001)")
    })
    @GetMapping("/me")
    public ResponseEntity<UserDto.Response> getMyInfo(
            @AuthenticationPrincipal Long userId) {
        UserDto.Response response = userService.getMyInfo(userId);
        return ResponseEntity.ok(response);
    }


    @Operation(
        summary = "닉네임 변경",
        description = "인증된 본인의 닉네임을 변경한다. 중복 닉네임이면 409(U003).",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "변경 성공 (변경된 내 정보 반환)"),
            @ApiResponse(responseCode = "400", description = "입력값 검증 실패 (C001)"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 요청"),
            @ApiResponse(responseCode = "409", description = "닉네임 중복 (U003)")
    })
    @PatchMapping("/me")
    public ResponseEntity<UserDto.Response> updateNickname(
            @AuthenticationPrincipal Long userId,
            @RequestBody @Valid UserDto.UpdateNicknameRequest request) {
        UserDto.Response response = userService.updateNickname(userId, request.nickname());
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "회원 탈퇴",
            description = "인증된 본인 계정을 탈퇴(status=DELETED) 처리한다. 성공 시 204, 본문 없음.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "탈퇴 성공 (본문 없음)"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 요청"),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 회원 (U001)")
    })
    @DeleteMapping("/me")
    public ResponseEntity<Void> withdraw(@AuthenticationPrincipal Long userId) {
        userService.withdraw(userId);
        return ResponseEntity.noContent().build();
    }
}