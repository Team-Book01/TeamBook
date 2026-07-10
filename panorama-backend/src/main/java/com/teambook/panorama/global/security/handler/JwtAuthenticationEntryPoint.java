package com.teambook.panorama.global.security.handler;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teambook.panorama.global.exception.ErrorCode;
import com.teambook.panorama.global.exception.ErrorResponse;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    
    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        // TODO: 인증 안 된 사용자의 보호 자원 접근 → 401
        //       response.setStatus(401) + JSON 에러 바디 작성
        ErrorCode errorCode = ErrorCode.INVALID_TOKEN;
        response.setStatus(401);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), 
                ErrorResponse.of(errorCode, errorCode.getMessage()));

    }
}