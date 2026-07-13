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

    @Bean
    public OpenAPI panoramaOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Panorama API")          // 문서 제목
                        .version("v1")                  // API 버전
                        .description("Panorama 백엔드 API 문서")) // 설명
                // JWT Bearer 인증 스킴 등록 → Swagger UI의 Authorize 버튼에서 access 토큰 입력 가능
                .components(new Components()
                        .addSecuritySchemes(BEARER_SCHEME, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
