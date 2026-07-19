package com.teambook.panorama.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  @Value("${app.upload.dir}")
  private String uploadDir;

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // /images/** 요청을 디스크의 업로드 폴더에서 직접 서빙 (컨트롤러 없이)
    registry.addResourceHandler("/images/**")
        .addResourceLocations("file:" + uploadDir + "/");
  }
}
