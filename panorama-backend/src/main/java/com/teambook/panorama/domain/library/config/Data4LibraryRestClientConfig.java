package com.teambook.panorama.domain.library.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * 정보나루(data4library) 호출용 RestClient 설정.
 * base-url 은 application.yml, 인증키는 호출 시점에 쿼리파라미터로 붙인다(Data4LibraryClient).
 */
@Configuration
public class Data4LibraryRestClientConfig {

  @Value("${data4library.base-url}")
  private String baseUrl;

  @Bean
  public RestClient data4LibraryRestClient() {
    return RestClient.builder()
        .baseUrl(baseUrl)
        .build();
  }
}
