package com.teambook.panorama.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 설정.
 *
 * <p>비어 있던 클래스에 최소 필터체인을 정의한다. 지금 목적은 "Swagger 문서 화면을
 * 인증 없이 열 수 있게" 하는 것. 나머지 요청은 여전히 인증을 요구하도록 남겨둔다.
 * (추후 JWT 인증 필터를 이 위에 얹어 확장할 예정)
 */
@Configuration        // 이 클래스가 스프링 설정(Bean 정의) 클래스임을 표시
@EnableWebSecurity    // Spring Security의 웹 보안 기능을 켜고 아래 필터체인을 사용하게 함
public class SecurityConfig {

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
     * SecurityFilterChain = "어떤 요청을 허용/차단할지"를 정의하는 보안 규칙 묶음.
     * 이 메서드가 반환하는 Bean을 Spring Security가 모든 HTTP 요청에 적용한다.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CSRF: 폼 기반 웹에서 필요한 보호 장치. 우리는 REST API + 문서용이라 끔.
                // (JWT 같은 토큰 인증을 쓰면 보통 CSRF는 비활성화한다)
                .csrf(csrf -> csrf.disable())

                // 요청별 인가 규칙
                .authorizeHttpRequests(auth -> auth
                        // Swagger 관련 경로는 로그인 없이 누구나 허용
                        .requestMatchers(SWAGGER_WHITELIST).permitAll()
                        // 그 외 모든 요청은 인증 필요 (나중에 JWT로 통과시킬 대상)
                        .anyRequest().authenticated()
                )

                // 인증되지 않은 요청에 대해 기본 HTTP Basic 인증 창을 사용(임시).
                // 나중에 JWT 필터로 교체하면 된다.
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
