package com.teambook.panorama.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerApiConfig {

    // 컨트롤러의 @SecurityRequirement(name = "bearerAuth")와 이름이 일치해야 함
    private static final String BEARER_SCHEME = "bearerAuth";

    // 소셜 로그인은 브라우저 리다이렉트 기반이라 REST 엔드포인트로 문서화할 수 없어 설명으로 안내한다.
    private static final String DESCRIPTION = """
            Panorama 백엔드 API 문서

            ## 소셜 로그인 (Google)
            OAuth2 소셜 로그인은 브라우저 리다이렉트 흐름이라 아래 경로는 Swagger의 개별 API로 뜨지 않습니다.

            1. **로그인 시작**: 브라우저를 `GET /oauth2/authorization/google` 로 이동
               → 서버가 구글 로그인 화면으로 302 리다이렉트
            2. **콜백(자동)**: 구글 인증 후 `/login/oauth2/code/google` 로 돌아오며 서버가 처리
            3. **프론트 복귀**: 서버가 프론트 콜백으로 302 리다이렉트
               → `{redirect-uri}/oauth/callback?token={accessToken}&provider={provider}`
               - `token`: 우리 서비스의 access 토큰(프론트는 메모리에 저장)
               - `provider`: 로그인 수단(localStorage에 '최근 로그인 수단'으로 저장)
               - refresh 토큰은 HttpOnly 쿠키(`refreshToken`)로 함께 발급됨

            이후 요청은 로컬 로그인과 동일하게 `Authorization: Bearer {token}` 헤더로 인증합니다.
            """;

    @Bean
    public OpenAPI panoramaOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Panorama API")          // 문서 제목
                        .version("v1")                  // API 버전
                        .description(DESCRIPTION))      // 설명 (소셜 로그인 흐름 안내 포함)
                // JWT Bearer 인증 스킴 등록 → Swagger UI의 Authorize 버튼에서 access 토큰 입력 가능
                .components(new Components()
                        .addSecuritySchemes(BEARER_SCHEME, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
