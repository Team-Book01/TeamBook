package com.teambook.panorama.domain.book.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import com.teambook.panorama.domain.book.client.NaverBookClient;
import com.teambook.panorama.domain.book.dto.naver.NaverBookResponse;
import com.teambook.panorama.domain.book.dto.search.BookSearchResponse;
import com.teambook.panorama.domain.book.service.BookSearchService;

@Configuration
public class NaverRestClientConfig {

  @Value("${naver.client-id}")
  private String clientId;

  @Value("${naver.client-secret}")
  private String clientSecret;

  @Bean
  public RestClient naverRestClient() {
    return RestClient.builder()
    .baseUrl("https://openapi.naver.com")
    .defaultHeader("X-Naver-Client-Id", clientId)
    .defaultHeader("X-Naver-Client-Secret", clientSecret)
    .build();
  }

}
