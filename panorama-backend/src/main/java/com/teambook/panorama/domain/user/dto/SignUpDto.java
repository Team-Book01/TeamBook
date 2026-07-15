package com.teambook.panorama.domain.user.dto;

import com.teambook.panorama.domain.user.entity.User;
import com.teambook.panorama.global.constant.ValidationPattern;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class SignUpDto {
  @Schema(name = "SignUpRequest", description = "로컬 회원가입 요청")
  public record Request(
            @Schema(description = "로그인 아이디 (6~15자, 영문·숫자·밑줄(_)만)", example = "testuser1")
            @NotBlank
            @Size(min = ValidationPattern.LOGIN_ID_MIN, max = ValidationPattern.LOGIN_ID_MAX)
            @Pattern(regexp = ValidationPattern.LOGIN_ID, message = ValidationPattern.LOGIN_ID_MESSAGE)
            String loginId,

            @Schema(description = "비밀번호 (8~15자, 대소문자·특수문자 포함)", example = "Test1234!")
            @NotBlank
            @Size(min = ValidationPattern.PASSWORD_MIN, max = ValidationPattern.PASSWORD_MAX)
            @Pattern(regexp = ValidationPattern.PASSWORD, message = ValidationPattern.PASSWORD_MESSAGE)
            String password,

            @Schema(description = "닉네임 (1~10자, 한글·영문·숫자·밑줄(_)만)", example = "테스터")
            @NotBlank
            @Size(min = ValidationPattern.NICKNAME_MIN, max = ValidationPattern.NICKNAME_MAX)
            @Pattern(regexp = ValidationPattern.NICKNAME,
                message = ValidationPattern.NICKNAME_MESSAGE)
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
