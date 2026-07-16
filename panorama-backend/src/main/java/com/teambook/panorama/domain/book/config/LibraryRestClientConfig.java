package com.teambook.panorama.domain.book.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;


@Configuration
public class LibraryRestClientConfig {

  

  @Bean
  public RestClient libraryRestClient() {
    return RestClient.builder()
    .baseUrl("http://data4library.kr/api")
    .build();
  }
}
