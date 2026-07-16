package com.teambook.panorama.global.security.oauth;

import java.util.Map;

import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;

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
            case "naver" -> ofNaver(attributes);   // 나중에
            case "kakao" -> ofKakao(attributes);
            default -> throw new BusinessException(ErrorCode.UNSUPPORTED_PROVIDER);
        };
    }

    private static OAuthAttributes ofGoogle(Map<String, Object> attributes) {
    String providerUserId = asString(attributes.get("sub"));   // ★ 구글 고유 ID
    if (providerUserId == null) {
        throw new OAuth2AuthenticationException(
                new OAuth2Error("invalid_user_info_response"), "구글 응답에 sub가 없습니다.");
    }

    String email = asString(attributes.get("email"));   // 없으면 null
    return new OAuthAttributes(Provider.GOOGLE, providerUserId, email);
    }

    private static OAuthAttributes ofNaver(Map<String, Object> attributes) {
    // 네이버는 사용자 정보가 "response" 하위에 중첩돼 온다. 없으면 카카오와 동일하게 던진다.
    if (!(attributes.get("response") instanceof Map<?, ?> response)) {
        throw new OAuth2AuthenticationException(
                new OAuth2Error("invalid_user_info_response"), "네이버 응답에 response가 없습니다.");
    }

    String providerUserId = asString(response.get("id"));   // 구글의 sub 자리
    if (providerUserId == null) {
        throw new OAuth2AuthenticationException(
                new OAuth2Error("invalid_user_info_response"), "네이버 응답에 id가 없습니다.");
    }

    String email = asString(response.get("email"));   // 없으면 null
    return new OAuthAttributes(Provider.NAVER, providerUserId, email);
    }

    private static OAuthAttributes ofKakao(Map<String, Object> attributes) {
    // 1) providerUserId = 최상위 id (Long으로 오므로 toString 필수)
    String providerUserId = asString(attributes.get("id"));   // ★ (String) 캐스팅 금지 — CCE 남
    if (providerUserId == null) {
        throw new OAuth2AuthenticationException(
                new OAuth2Error("invalid_user_info_response"), "카카오 응답에 id가 없습니다.");
    }

    // 2) email — scope에 없으니 원칙적으로 안 오지만, 콘솔에서 나중에 켜도 안전하도록 방어적으로
    String email = null;
    if (attributes.get("kakao_account") instanceof Map<?, ?> account) {
        email = asString(account.get("email"));   // 키 없으면 null
    }

    return new OAuthAttributes(Provider.KAKAO, providerUserId, email);
    }


    // ---- 공용 헬퍼 ----

    private static String asString(Object value) {
        return (value == null) ? null : value.toString();
    }
}