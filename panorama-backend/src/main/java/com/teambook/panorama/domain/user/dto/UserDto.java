package com.teambook.panorama.domain.user.dto;

import com.teambook.panorama.domain.user.entity.User;
import com.teambook.panorama.domain.user.enums.Provider;
import com.teambook.panorama.domain.user.enums.Role;

public class UserDto {
  public record Response(
            Long userId,
            String nickname,
            String profileImageUrl,
            Provider provider,
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

}
