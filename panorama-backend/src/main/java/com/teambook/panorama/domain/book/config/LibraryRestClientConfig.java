package com.teambook.panorama.domain.book.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;


@Configuration
public class LibraryRestClientConfig {

  

  @Bean
  public RestClient libraryRestClient() {
    var factory = new SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(3000);
    factory.setReadTimeout(5000);

    return RestClient.builder()
    .baseUrl("http://data4library.kr/api")
    .requestFactory(factory)
    .build();
  }
}
