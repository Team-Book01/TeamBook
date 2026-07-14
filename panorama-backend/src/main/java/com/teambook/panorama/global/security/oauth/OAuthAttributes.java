package com.teambook.panorama.global.security.oauth;

import java.util.Map;

import com.teambook.panorama.domain.user.enums.Provider;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class OAuthAttributes {

    private final Provider provider;
    private final String providerUserId;
    private final String providerEmail;

    public static OAuthAttributes of(String registrationId, Map<String, Object> attributes) {
        return switch (registrationId) {
            case "google" -> ofGoogle(attributes);
            // case "naver" -> ofNaver(attributes);   // 나중에
            // case "kakao" -> ofKakao(attributes);
            default -> throw new BusinessException(ErrorCode.UNSUPPORTED_PROVIDER);
        };
    }

    private static OAuthAttributes ofGoogle(Map<String, Object> attributes) {
        return new OAuthAttributes(
                Provider.GOOGLE,
                (String) attributes.get("sub"),     // ★ 구글 고유 ID
                (String) attributes.get("email"));
    }
}