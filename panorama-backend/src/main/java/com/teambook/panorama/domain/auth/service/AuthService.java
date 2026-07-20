package com.teambook.panorama.domain.auth.service;

import com.teambook.panorama.domain.auth.dto.LoginDto;
import com.teambook.panorama.domain.user.enums.Provider;

/**
 * 인증(auth) 도메인 서비스. 구현체는 {@link AuthServiceImpl}.
 */
public interface AuthService {

    /** 로컬 로그인. access 토큰 + rawRefresh + provider 를 담은 결과 반환. */
    LoginDto.IssueResult login(LoginDto.Request request);

    /** refresh 토큰으로 새 access 토큰 재발급. */
    String reissue(String rawRefresh);

    /** 로그아웃 (저장된 refresh 토큰 삭제). */
    void logout(Long userId);

    /** 소셜 로그인 성공 처리 (refresh 저장 + 로그인 이력 기록). */
    void recordSocialLogin(Long userId, String rawRefresh, Provider provider);
}
