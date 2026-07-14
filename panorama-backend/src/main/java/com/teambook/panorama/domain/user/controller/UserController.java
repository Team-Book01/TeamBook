package com.teambook.panorama.domain.user.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.auth.dto.PasswordDto;
import com.teambook.panorama.domain.auth.service.PasswordService;
import com.teambook.panorama.domain.user.dto.SignUpDto;
import com.teambook.panorama.domain.user.dto.UserDto;
import com.teambook.panorama.domain.user.service.UserService;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
    private final PasswordService passwordService;

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
     * 아이디·닉네임 중복 확인. 회원가입 폼의 실시간 검증용(로그인 불필요).
     * loginId 또는 nickname 중 정확히 하나만 쿼리로 받는다.
     */
    @Operation(
            summary = "아이디·닉네임 중복 확인",
            description = "회원가입 전 loginId 또는 nickname의 사용 가능 여부를 확인한다. "
                    + "`loginId` 또는 `nickname` 중 정확히 하나만 쿼리 파라미터로 전달해야 한다. "
                    + "(이메일은 가입 여부 열거 우려로 제외)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "확인 성공 (exists=true면 이미 사용 중)"),
            @ApiResponse(responseCode = "400", description = "loginId·nickname을 둘 다 주거나 둘 다 안 준 경우 (C001)")
    })
    @GetMapping("/exists")
    public ResponseEntity<UserDto.ExistsResponse> checkExists(
            @Parameter(description = "확인할 로그인 아이디", example = "testuser1")
            @RequestParam(required = false) String loginId,
            @Parameter(description = "확인할 닉네임", example = "테스터")
            @RequestParam(required = false) String nickname) {
        // 정확히 하나만 전달되어야 함
        boolean hasLoginId = loginId != null && !loginId.isBlank();
        boolean hasNickname = nickname != null && !nickname.isBlank();
        if (hasLoginId == hasNickname) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        boolean exists = hasLoginId
                ? userService.isLoginIdTaken(loginId)
                : userService.isNicknameTaken(nickname);
        return ResponseEntity.ok(new UserDto.ExistsResponse(exists));
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

    @Operation(
            summary = "비밀번호 변경",
            description = "로그인 상태에서 현재 비밀번호를 확인하고 새 비밀번호로 변경한다. "
                    + "현재 비밀번호가 일치하지 않으면 401(A009). "
                    + "※ SMTP와 무관한 로그인 기반 변경이나, 현재 로직은 미구현(확장 예정).",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "변경 성공 (본문 없음)"),
            @ApiResponse(responseCode = "400", description = "입력값 검증 실패 (C001)"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 요청 · 현재 비밀번호 불일치 (A009)"),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 회원 (U001)")
    })
    @PatchMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal Long userId,
            @RequestBody @Valid PasswordDto.ChangeRequest request) {
        passwordService.changePassword(userId, request.currentPassword(), request.newPassword());
        return ResponseEntity.noContent().build();
    }
}