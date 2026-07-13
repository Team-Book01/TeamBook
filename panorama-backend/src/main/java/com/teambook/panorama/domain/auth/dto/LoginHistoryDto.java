package com.teambook.panorama.domain.auth.dto;

import java.time.LocalDateTime;

import com.teambook.panorama.domain.auth.entity.LoginHistory;
import com.teambook.panorama.domain.auth.enums.LoginResult;
import com.teambook.panorama.domain.user.enums.Provider;

public class LoginHistoryDto {
    public record Response(Provider provider, LoginResult result, LocalDateTime attemptedAt) {
        public static Response from(LoginHistory h) {
            return new Response(h.getProvider(), h.getResult(), h.getAttemptedAt());
        }
    }
}