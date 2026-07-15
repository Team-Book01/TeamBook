package com.teambook.panorama.domain.user.dto;

import com.teambook.panorama.domain.user.entity.User;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class SignUpDto {
  @Schema(name = "SignUpRequest", description = "로컬 회원가입 요청")
  public record Request(
            @Schema(description = "로그인 아이디 (6~15자, 공백 불가)", example = "testuser1")
            @NotBlank
            @Size(min = 6, max = 15)
            @Pattern(regexp = "^\\S+$", message = "공백을 포함할 수 없습니다")
            String loginId,

            @Schema(description = "비밀번호 (8~15자, 대소문자·특수문자 포함)", example = "Test1234!")
            @NotBlank
            @Size(min = 8, max = 15)
            @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9\\s])\\S+$",
                message = "대소문자와 특수문자를 포함해야 하며, 공백을 포함할 수 없습니다"
            )
            String password,

            @Schema(description = "닉네임 (1~10자, 공백 불가)", example = "테스터")
            @NotBlank
            @Size(min = 1, max = 10)
            @Pattern(regexp = "^\\S+$", message = "공백을 포함할 수 없습니다")
            String nickname,

            @Schema(description = "이메일", example = "test@example.com")
            @NotBlank
            @Email
            String email
    ) {}

    @Schema(name = "SignUpResponse", description = "회원가입 결과")
    public record Response(
            @Schema(description = "생성된 회원 ID", example = "1")
            Long userId,

            @Schema(description = "로그인 아이디", example = "testuser1")
            String loginId,

            @Schema(description = "닉네임", example = "테스터")
            String nickname
    ) {
        public static Response from(User user) {
            return new Response(user.getId(), user.getLoginId(), user.getNickname());
        }
    }
}
