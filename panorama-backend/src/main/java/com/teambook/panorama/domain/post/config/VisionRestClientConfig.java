package com.teambook.panorama.domain.post.config;

import java.time.Duration;

import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * Vision(OCR) 호출용 RestClient 설정. Data4LibraryRestClientConfig(#23 리뷰 반영분) 패턴 복제.
 * 인증키는 호출 시점에 쿼리파라미터로 붙인다(BookOcrServiceImpl).
 *
 * <p>connect/read 타임아웃을 반드시 건다. 타임아웃이 없으면 외부 API 지연·무응답 시
 * 요청 스레드가 무한 대기한다. 요청마다 RestClient.create() 하던 방식도 빈 재사용으로 대체.</p>
 */
@Configuration
public class VisionRestClientConfig {

  @Bean
  public RestClient visionRestClient() {
    ClientHttpRequestFactorySettings settings = ClientHttpRequestFactorySettings.defaults()
        .withConnectTimeout(Duration.ofSeconds(3))
        .withReadTimeout(Duration.ofSeconds(10));
    return RestClient.builder()
        .requestFactory(ClientHttpRequestFactoryBuilder.detect().build(settings))
        .baseUrl("https://vision.googleapis.com")
        .build();
  }
}
