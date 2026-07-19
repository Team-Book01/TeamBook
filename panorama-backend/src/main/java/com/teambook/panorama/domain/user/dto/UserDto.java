package com.teambook.panorama.domain.user.dto;

import com.teambook.panorama.domain.user.entity.User;
import com.teambook.panorama.domain.user.enums.Provider;
import com.teambook.panorama.domain.user.enums.Role;
import com.teambook.panorama.global.constant.ValidationPattern;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UserDto {
  @Schema(name = "UserResponse", description = "내 정보 조회 응답")
  public record Response(
            @Schema(description = "회원 ID", example = "1")
            Long userId,

            @Schema(description = "로그인 아이디 (LOCAL 계정만 존재, 소셜은 null)", example = "testuser1", nullable = true)
            String loginId,

            @Schema(description = "닉네임", example = "테스터")
            String nickname,

            @Schema(description = "프로필 이미지 URL", nullable = true)
            String profileImageUrl,

            @Schema(description = "로그인 수단", example = "LOCAL")
            Provider provider,

            @Schema(description = "권한", example = "USER")
            Role role,

            @Schema(description = "인증 완료된 이메일 (미인증·소셜은 null)", example = "user@example.com", nullable = true)
            String email,

            @Schema(description = "이메일 인증 여부 (email 존재 여부와 동일)", example = "false")
            boolean emailVerified
    ) {
        public static Response from(User user) {
            return new Response(
                    user.getId(),
                    user.getLoginId(),
                    user.getNickname(),
                    user.getProfileImageUrl(),
                    user.getProvider(),
                    user.getRole(),
                    user.getEmail(),          // 인증된 주소만 저장돼 있음(미인증·소셜은 null)
                    user.hasVerifiedEmail()   // 인증 완료 여부 = email 존재 여부 파생
            );
        }
    }

    @Schema(name = "UserNicknameRequest", description = "닉네임 변경 요청")
    public record UpdateNicknameRequest(
        @NotBlank
        @Size(min = ValidationPattern.NICKNAME_MIN, max = ValidationPattern.NICKNAME_MAX,
            message = "닉네임은 1~10자여야 합니다.")
        @Pattern(regexp = ValidationPattern.NICKNAME,
            message = ValidationPattern.NICKNAME_MESSAGE)
        String nickname) {

        }

    @Schema(name = "UserExistsResponse", description = "아이디·닉네임 중복 확인 결과")
    public record ExistsResponse(
            @Schema(description = "이미 사용 중이면 true (가입 불가), 사용 가능하면 false", example = "false")
            boolean exists
    ) {}

}
