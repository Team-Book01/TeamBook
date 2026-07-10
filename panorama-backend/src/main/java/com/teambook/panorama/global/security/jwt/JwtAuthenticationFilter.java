package com.teambook.panorama.global.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        // TODO
        // 1. resolveToken(request) 로 Authorization 헤더에서 access 추출
        // 2. 토큰이 있고 validateToken 통과하면:
        //    - getUserId → Authentication 생성
        //    - SecurityContextHolder.getContext().setAuthentication(auth)
        // 3. filterChain.doFilter(request, response) 로 다음으로 넘김
        //    (인증 실패해도 여기서 예외 던지지 말고 통과 → EntryPoint가 처리)
        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        // TODO: "Authorization: Bearer xxx" 에서 "Bearer " 제거하고 토큰만 반환
        //       헤더 없거나 형식 안 맞으면 null
        return null;
    }
}