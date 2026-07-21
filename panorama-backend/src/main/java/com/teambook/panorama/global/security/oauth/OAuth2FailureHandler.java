package com.teambook.panorama.global.security.oauth;

import java.io.IOException;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import com.teambook.panorama.global.exception.ErrorCode;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
            HttpServletResponse response, AuthenticationException exception) throws IOException {

        ErrorCode errorCode = resolve(exception);   // 아래
        // 로컬 login의 catch가 하던 "사유 분리"를 여기서
        // 필요하면 실패 이력도 여기서 기록 (단, providerUserId 특정 문제 ↓)

        // 응답: 소셜은 브라우저 리다이렉트라, 에러 페이지로 리다이렉트하는 게 자연스러움
        getRedirectStrategy().sendRedirect(request, response,
                "http://localhost:5173/login?error=" + errorCode.getCode());
    }

    private ErrorCode resolve(AuthenticationException e) {
        if (e instanceof OAuth2AuthenticationException oae) {
            String code = oae.getError().getErrorCode();
            if (ErrorCode.ACCOUNT_DELETED.getCode().equals(code))   return ErrorCode.ACCOUNT_DELETED;
            if (ErrorCode.ACCOUNT_SUSPENDED.getCode().equals(code)) return ErrorCode.ACCOUNT_SUSPENDED;
        }
        return ErrorCode.LOGIN_FAILED;
    }
}