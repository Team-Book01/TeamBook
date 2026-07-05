package com.teambook.panorama.global.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerApiConfig {

    @Bean
    public OpenAPI panoramaOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Panorama API")          // 문서 제목
                        .version("v1")                  // API 버전
                        .description("Panorama 백엔드 API 문서")); // 설명
    }
}
