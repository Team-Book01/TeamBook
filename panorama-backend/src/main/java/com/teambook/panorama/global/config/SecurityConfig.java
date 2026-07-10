// package com.teambook.panorama.global.config;

// import com.teambook.panorama.global.security.handler.JwtAccessDeniedHandler;
// import com.teambook.panorama.global.security.handler.JwtAuthenticationEntryPoint;
// import com.teambook.panorama.global.security.jwt.JwtAuthenticationFilter;
// import lombok.RequiredArgsConstructor;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.config.http.SessionCreationPolicy;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
// import org.springframework.web.cors.CorsConfigurationSource;

// /**
//  * Spring Security 설정.
//  *
//  * <p>Swagger 문서 화면과 인증 관련 엔드포인트(로그인·회원가입 등)는 인증 없이 열 수 있게 하고,
//  * 나머지 요청은 JWT 인증을 요구한다. 세션을 쓰지 않는 STATELESS 방식이며, 인증/인가 실패는
//  * 각각 EntryPoint(401)·AccessDeniedHandler(403)로 처리한다.
//  */
// @Configuration        // 이 클래스가 스프링 설정(Bean 정의) 클래스임을 표시
// @EnableWebSecurity    // Spring Security의 웹 보안 기능을 켜고 아래 필터체인을 사용하게 함
// @RequiredArgsConstructor
// public class SecurityConfig {

//     // JWT 인증 필터 및 인증/인가 실패 처리 핸들러 (아래 필터체인에서 사용)
//     private final JwtAuthenticationFilter jwtAuthenticationFilter;
//     private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
//     private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

//     /**
//      * 인증 없이 접근을 허용할 Swagger / OpenAPI 관련 경로들.
//      * - /swagger-ui.html, /swagger-ui/**  : 사람이 보는 문서 UI 화면과 정적 리소스
//      * - /v3/api-docs/**                    : UI가 읽어오는 OpenAPI 명세(JSON)
//      */
//     private static final String[] SWAGGER_WHITELIST = {
//             "/swagger-ui.html",
//             "/swagger-ui/**",
//             "/v3/api-docs/**"
//     };

//     /**
//      * 인증 없이 접근을 허용할 인증 관련 경로들.
//      * - /api/auth/**   : 로그인, 토큰 재발급 등 (토큰을 발급받기 전 단계라 인증 불가)
//      * - /api/users     : 회원가입 (로그인 전에 계정을 만드는 단계)
//      */
//     private static final String[] AUTH_WHITELIST = {
//             "/api/auth/**",
//             "/api/users"
//     };

//     /**
//      * SecurityFilterChain = "어떤 요청을 허용/차단할지"를 정의하는 보안 규칙 묶음.
//      * 이 메서드가 반환하는 Bean을 Spring Security가 모든 HTTP 요청에 적용한다.
//      */
//     @Bean
//     public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//         http
//                 // CSRF: 폼 기반 웹에서 필요한 보호 장치. 우리는 REST API + 토큰 인증이라 끔.
//                 // (JWT 같은 토큰 인증을 쓰면 보통 CSRF는 비활성화한다)
//                 .csrf(csrf -> csrf.disable())

//                 // CORS: React(다른 origin)와 쿠키를 주고받기 위해 활성화 (아래 corsConfigurationSource 빈 사용)
//                 .cors(cors -> {})

//                 // 세션 미사용: JWT로 인증하므로 서버가 세션을 만들지 않는 STATELESS 방식
//                 .sessionManagement(session ->
//                         session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

//                 // 요청별 인가 규칙
//                 .authorizeHttpRequests(auth -> auth
//                         // Swagger 관련 경로는 로그인 없이 누구나 허용
//                         .requestMatchers(SWAGGER_WHITELIST).permitAll()
//                         // 로그인·회원가입 등 인증 전 단계 경로도 허용
//                         .requestMatchers(AUTH_WHITELIST).permitAll()
//                         // 그 외 모든 요청은 인증 필요 (JWT 필터가 통과시킨 요청만 접근 가능)
//                         .anyRequest().authenticated()
//                 )

//                 // 인증/인가 실패 처리: 인증 안 됨 → 401, 권한 부족 → 403
//                 .exceptionHandling(ex -> ex
//                         .authenticationEntryPoint(jwtAuthenticationEntryPoint)
//                         .accessDeniedHandler(jwtAccessDeniedHandler)
//                 )

//                 // JWT 인증 필터를 폼 인증 필터 앞에 등록 (요청의 Bearer 토큰을 먼저 검사)
//                 .addFilterBefore(jwtAuthenticationFilter,
//                         UsernamePasswordAuthenticationFilter.class);

//         return http.build();
//     }

//     /**
//      * 비밀번호 인코더. 회원가입 시 해싱 저장, 로그인 시 matches()로 검증에 사용된다.
//      */
//     @Bean
//     public PasswordEncoder passwordEncoder() {
//         return new BCryptPasswordEncoder();
//     }

//     /**
//      * AuthenticationManager. 로그인 시 loginId/비밀번호 검증을 수행한다.
//      * (내부적으로 UserDetailsService + PasswordEncoder를 호출)
//      */
//     @Bean
//     public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
//             throws Exception {
//         return config.getAuthenticationManager();
//     }

//     /**
//      * CORS 설정. 쿠키 방식(RefreshToken)을 쓰므로 allowCredentials(true)가 필수이며,
//      * 이 경우 allowedOrigins에 "*"를 쓸 수 없어 React 주소를 정확히 명시해야 한다.
//      */
//     @Bean
//     public CorsConfigurationSource corsConfigurationSource() {
//         // TODO: allowedOrigins("http://localhost:5173"), allowedMethods/Headers,
//         //       allowCredentials(true) 설정 후 "/**" 에 등록해 반환
//         return null;
//     }
// }


package com.teambook.panorama.global.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

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

    private static final String[] SWAGGER_WHITELIST = {
            "/swagger-ui.html",
            "/swagger-ui/**",
            "/v3/api-docs/**"
    };

    private static final String[] AUTH_WHITELIST = {
            "/api/auth/**",
            "/api/users"
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(SWAGGER_WHITELIST).permitAll()
                        .requestMatchers(AUTH_WHITELIST).permitAll()
                        .anyRequest().authenticated()
                );
        // TODO(5~7단계): JWT 필터·예외 핸들러 추가
        //   - .cors(...) 로 corsConfigurationSource 연결
        //   - .exceptionHandling(entryPoint, accessDeniedHandler)
        //   - .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}