package com.teambook.panorama.global.security.jwt;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.teambook.panorama.domain.user.enums.Role;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTH_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        // TODO
        // 1. resolveToken(request) 로 Authorization 헤더에서 access 추출
        String token = resolveToken(request);
        // 2. 토큰이 있고 validateToken 통과하면:
        //    - getUserId → Authentication 생성
        //    - SecurityContextHolder.getContext().setAuthentication(auth)
        if (token != null && jwtProvider.validateToken(token)){
            Long userId = jwtProvider.getUserId(token);
            Role role = jwtProvider.getRole(token);

            var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
            var authentication = new UsernamePasswordAuthenticationToken(
                userId, 
                null, 
                authorities
            );
            // ip, 세션 부가정보 추가 입력, 지금 프로젝트에서는 사용할일 없음
            // authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
        }
        // 3. filterChain.doFilter(request, response) 로 다음으로 넘김
        //    (인증 실패해도 여기서 예외 던지지 말고 통과 → EntryPoint가 처리)
        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        // TODO: "Authorization: Bearer xxx" 에서 "Bearer " 제거하고 토큰만 반환
        //       헤더 없거나 형식 안 맞으면 null
        String bearer = request.getHeader(AUTH_HEADER);
        if (StringUtils.hasText(bearer) && bearer.startsWith(BEARER_PREFIX)){
            return bearer.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}