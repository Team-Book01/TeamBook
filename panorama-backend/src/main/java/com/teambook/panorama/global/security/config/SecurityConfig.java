package com.teambook.panorama.global.security.config;

import com.teambook.panorama.global.security.oauth.HttpCookieOAuth2AuthorizationRequestRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.teambook.panorama.global.security.handler.JwtAccessDeniedHandler;
import com.teambook.panorama.global.security.handler.JwtAuthenticationEntryPoint;
import com.teambook.panorama.global.security.jwt.JwtAuthenticationFilter;
import com.teambook.panorama.global.security.oauth.CustomOAuth2UserService;
import com.teambook.panorama.global.security.oauth.OAuth2SuccessHandler;

/**
 * Spring Security 설정 (현재 단계: JWT 필터 도입 전).
 *
 * <p>Swagger·인증 관련 경로는 열어두고 나머지는 인증을 요구한다.
 * JWT 인증 필터·예외 핸들러는 5~7단계에서 추가 예정.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;
        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
        private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
        private final CustomOAuth2UserService customOAuth2UserService;
        private final OAuth2SuccessHandler oAuth2SuccessHandler;

        /**
         * 인증 없이 접근을 허용할 Swagger / OpenAPI 관련 경로들.
         * - /swagger-ui.html, /swagger-ui/**  : 사람이 보는 문서 UI 화면과 정적 리소스
         * - /v3/api-docs/**                    : UI가 읽어오는 OpenAPI 명세(JSON)
         */
        private static final String[] SWAGGER_WHITELIST = {
                "/swagger-ui.html",
                "/swagger-ui/**",
                "/v3/api-docs/**"
        };

        /**
         * 인증 없이 접근을 허용할 인증 관련 경로들.
         * - /api/v1/auth/**   : 로그인, 토큰 재발급 등 (토큰을 발급받기 전 단계라 인증 불가)
         * - /api/v1/users     : 회원가입 (로그인 전에 계정을 만드는 단계)
         */
        private static final String[] AUTH_WHITELIST = {
                "/api/v1/auth/**",
                "/api/v1/users",
                "/api/v1/books/search",
                "/api/v1/users/exists",   // 회원가입 전 아이디·닉네임 중복 확인 (로그인 불필요)
                "/oauth2/**",          // 로그인 시작: /oauth2/authorization/google
                "/login/oauth2/**",     // 구글 콜백: /login/oauth2/code/google
                "/images/**"    // 업로드 이미지 정적 서빙 (브라우저 img 태그는 토큰을 실을 수 없음)
        };

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                // TODO(5~7단계): JWT 필터·예외 핸들러 추가
                //   - .cors(...) 로 corsConfigurationSource 연결
                //   - .exceptionHandling(entryPoint, accessDeniedHandler)
                //   - .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                http
                        // CSRF: 폼 기반 웹에서 필요한 보호 장치. 우리는 REST API + 토큰 인증이라 끔.
                        .csrf(csrf -> csrf.disable())
                        // CORS: React(다른 origin)와 쿠키를 주고받기 위해 활성화 (아래 corsConfigurationSource 빈 사용)
                        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                        // 세션 미사용: JWT로 인증하므로 서버가 세션을 만들지 않는 STATELESS 방식
                        .sessionManagement(session ->
                                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                        // 요청별 인가 규칙
                        .authorizeHttpRequests(auth -> auth
                                .requestMatchers(SWAGGER_WHITELIST).permitAll()
                                .requestMatchers(AUTH_WHITELIST).permitAll()
                                // 도서관 목록은 비로그인 열람이지만 "읽기만" 공개다.
                                // 메서드를 안 가리면 나중에 같은 경로에 POST/DELETE 가 붙는 순간 함께 열린다.
                                .requestMatchers(HttpMethod.GET, "/api/v1/libraries").permitAll()
                                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/v1/books/**").permitAll()
                                // 마이페이지 조회는 인증 필요. 아래 /reviews/** permitAll 보다 먼저 와야 한다.
                                // (Spring Security 는 먼저 매칭된 규칙이 적용되므로 순서를 바꾸면 뚫린다)
                                .requestMatchers(HttpMethod.GET,
                                                "/api/v1/reviews/myReviewList",
                                                "/api/v1/reviews/myReviewCount").authenticated()
                                // 리뷰 목록 조회는 공개(도서 상세와 동일). 작성/수정/삭제는 인증 필요.
                                .requestMatchers(HttpMethod.GET, "/api/v1/reviews/**").permitAll()
                                // 소장 도서관 조회는 도서 상세에 딸린 공개 정보(비로그인도 조회 가능).
                                .requestMatchers(HttpMethod.GET, "/api/v1/library/**").permitAll()
                                .anyRequest().authenticated()
                        )
                        // 인증/인가 실패 처리: 인증 안 됨 → 401, 권한 부족 → 403
                        .exceptionHandling(ex -> ex
                                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                                .accessDeniedHandler(jwtAccessDeniedHandler)
                        )
                        // 소셜 로그인
                        .oauth2Login(oauth2 -> oauth2
                                .authorizationEndpoint(a -> a
                                        .authorizationRequestRepository(httpCookieOAuth2AuthorizationRequestRepository)
                                )
                                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                                .successHandler(oAuth2SuccessHandler)
                        )
                        // JWT 인증 필터를 폼 인증 필터 앞에 등록 (요청의 Bearer 토큰을 먼저 검사)
                        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        /**
         * CORS 설정. 쿠키 방식(RefreshToken)을 쓰므로 allowCredentials(true)가 필수이며,
         * 이 경우 allowedOrigins에 "*"를 쓸 수 없어 React 주소를 정확히 명시해야 한다.
         */
        @Bean
        public CorsConfigurationSource corsConfigurationSource(){
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of("http://localhost:5173"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }
}
