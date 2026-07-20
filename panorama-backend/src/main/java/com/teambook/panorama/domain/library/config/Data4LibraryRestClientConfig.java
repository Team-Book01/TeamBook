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
 * <p>connect/read 타임아웃을 반드시 건다. 수집은 트랜잭션 밖(LibrarySyncFetcher)이라 DB 커넥션을
 * 잡지는 않지만, 타임아웃이 없으면 정보나루 지연·무응답 시 요청 스레드가 무한 대기한다.
 * 그 스레드는 동기화 락을 쥔 채라 이후의 모든 동기화가 409 로 거절되고, 락이 풀릴 방법도 없다.
 */
@Configuration
public class Data4LibraryRestClientConfig {

  @Value("${data4library.base-url}")
  private String baseUrl;

  @Bean
  public RestClient data4LibraryRestClient() {
    // readTimeout 은 "바이트 사이의 유휴 시간"이 아니라 응답 본문을 다 읽기까지의 총 시간이다.
    // 10초로는 부족했다 — 정보나루가 느린 순간 39KB 응답을 다 못 보내 타임아웃 핸들러가 읽는 도중
    // 스트림을 닫았고, Jackson 이 배열 중간(libs[93])에서 "JSON parse error: closed" 로 죽었다.
    // 20초로 여유를 두되, 무한정 늘리지 않고 부족분은 Data4LibraryClient 의 페이지 단위 재시도로 메운다.
    // (타임아웃을 크게 잡을수록 락을 쥔 채 매달려 있는 시간이 길어진다 — 위 주석 참고)
    ClientHttpRequestFactorySettings settings = ClientHttpRequestFactorySettings.defaults()
        .withConnectTimeout(Duration.ofSeconds(3))
        .withReadTimeout(Duration.ofSeconds(20));
    return RestClient.builder()
        .requestFactory(ClientHttpRequestFactoryBuilder.detect().build(settings))
        .baseUrl(baseUrl)
        .build();
  }
}
