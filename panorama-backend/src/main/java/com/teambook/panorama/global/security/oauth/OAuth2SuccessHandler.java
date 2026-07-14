package com.teambook.panorama.global.security.oauth;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.teambook.panorama.domain.auth.service.AuthService;
import com.teambook.panorama.domain.user.enums.Provider;
import com.teambook.panorama.domain.user.enums.Role;
import com.teambook.panorama.global.security.jwt.JwtProvider;
import com.teambook.panorama.global.security.util.CookieUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;
    private final AuthService authService;
    private final CookieUtil cookieUtil;

    @Value("${app.oauth2.redirect-uri}")   // 프론트 콜백 주소 (yml)
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        CustomOAuth2User principal = (CustomOAuth2User) authentication.getPrincipal();
        Long userId = principal.getUserId();
        Provider provider = principal.getProvider();
        Role role = principal.getRole();

        String accessToken = jwtProvider.createAccessToken(userId, role);
        String rawRefresh  = jwtProvider.createRefreshToken(userId);

        authService.recordSocialLogin(userId, rawRefresh, provider);

        response.addHeader(HttpHeaders.SET_COOKIE,
                cookieUtil.buildRefreshCookie(rawRefresh).toString());

        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("token", accessToken)
                .queryParam("provider", provider.name())
                .build().toUriString();
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
