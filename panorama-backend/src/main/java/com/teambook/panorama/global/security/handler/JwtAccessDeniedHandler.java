package com.teambook.panorama.global.security.handler;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teambook.panorama.global.exception.ErrorCode;
import com.teambook.panorama.global.exception.ErrorResponse;

@Component
@RequiredArgsConstructor
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        // TODO: 인증됐으나 권한 부족 → 403
        //       response.setStatus(403) + JSON 에러 바디 작성
        ErrorCode errorCode = ErrorCode.ACCESS_DENIED;
        response.setStatus(403);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), 
                ErrorResponse.of(errorCode, errorCode.getMessage()));
        
    }
}