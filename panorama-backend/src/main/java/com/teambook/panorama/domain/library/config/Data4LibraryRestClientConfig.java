package com.teambook.panorama.domain.library.config;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * 정보나루(data4library) 호출용 RestClient 설정.
 * base-url 은 application.yml, 인증키는 호출 시점에 쿼리파라미터로 붙인다(Data4LibraryClient).
 *
 * <p>connect/read 타임아웃을 반드시 건다. 동기화(sync)는 {@code @Transactional} 안에서
 * 외부 API 를 페이지 단위로 호출하므로, 타임아웃이 없으면 정보나루 지연·무응답 시
 * 요청 스레드가 무한 대기하며 DB 트랜잭션/커넥션을 계속 점유한다(커넥션 풀 고갈 위험).
 */
@Configuration
public class Data4LibraryRestClientConfig {

  @Value("${data4library.base-url}")
  private String baseUrl;

  @Bean
  public RestClient data4LibraryRestClient() {
    ClientHttpRequestFactorySettings settings = ClientHttpRequestFactorySettings.defaults()
        .withConnectTimeout(Duration.ofSeconds(3))
        .withReadTimeout(Duration.ofSeconds(10));
    return RestClient.builder()
        .requestFactory(ClientHttpRequestFactoryBuilder.detect().build(settings))
        .baseUrl(baseUrl)
        .build();
  }
}
