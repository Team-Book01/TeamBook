package com.teambook.panorama.domain.user.dto;

import com.teambook.panorama.domain.user.entity.User;
import com.teambook.panorama.domain.user.enums.Provider;
import com.teambook.panorama.domain.user.enums.Role;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

public class UserDto {
  @Schema(name = "UserResponse", description = "내 정보 조회 응답")
  public record Response(
            @Schema(description = "회원 ID", example = "1")
            Long userId,

            @Schema(description = "닉네임", example = "테스터")
            String nickname,

            @Schema(description = "프로필 이미지 URL", nullable = true)
            String profileImageUrl,

            @Schema(description = "로그인 수단", example = "LOCAL")
            Provider provider,

            @Schema(description = "권한", example = "USER")
            Role role
    ) {
        public static Response from(User user) {
            return new Response(
                    user.getId(),
                    user.getNickname(),
                    user.getProfileImageUrl(),
                    user.getProvider(),
                    user.getRole()
            );
        }
    }

    @Schema(name = "UserNicknameRequest", description = "닉네임 변경 요청")
    public record UpdateNicknameRequest(
        @Size(min = 1, max = 10, message = "닉네임은 1~10자여야 합니다.")
        String nickname) {

        }

    @Schema(name = "UserExistsResponse", description = "아이디·닉네임 중복 확인 결과")
    public record ExistsResponse(
            @Schema(description = "이미 사용 중이면 true (가입 불가), 사용 가능하면 false", example = "false")
            boolean exists
    ) {}

}
