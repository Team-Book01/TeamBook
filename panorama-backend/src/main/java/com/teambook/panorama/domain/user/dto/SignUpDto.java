package com.teambook.panorama.domain.user.dto;

import com.teambook.panorama.domain.user.entity.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class SignUpDto {
  public record Request(
            @NotBlank
            @Size(min = 6, max = 15)
            @Pattern(regexp = "^\\S+$", message = "공백을 포함할 수 없습니다")
            String loginId,

            @NotBlank
            @Size(min = 8, max = 15)
            @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).+$",
                message = "대소문자와 특수문자를 포함해야 합니다"
            )
            String password,

            @NotBlank
            @Size(min = 1, max = 10)
            @Pattern(regexp = "^\\S+$", message = "공백을 포함할 수 없습니다")
            String nickname,

            @NotBlank
            @Email
            String email
    ) {}

    public record Response(
            Long userId,
            String loginId,
            String nickname
    ) {
        public static Response from(User user) {
            return new Response(user.getId(), user.getLoginId(), user.getNickname());
        }
    }
}
