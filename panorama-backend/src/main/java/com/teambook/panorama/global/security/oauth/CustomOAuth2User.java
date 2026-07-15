package com.teambook.panorama.global.security.oauth;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.teambook.panorama.domain.user.enums.Provider;
import com.teambook.panorama.domain.user.enums.Role;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class CustomOAuth2User implements OAuth2User {

    private final Long userId;                       // ★ 우리 시스템 User PK
    private final Provider provider;
    private final Role role;
    private final Map<String, Object> attributes;    // 구글 원본 속성(그대로 보관)
    private final Collection<? extends GrantedAuthority> authorities;

    public static CustomOAuth2User of(Long userId, Provider provider, Role role, Map<String, Object> attributes){
      List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
      return new CustomOAuth2User(userId, provider, role, attributes, authorities);
    }


    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getName() {
        return String.valueOf(userId);
    }
}