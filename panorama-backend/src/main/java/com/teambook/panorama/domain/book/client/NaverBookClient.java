package com.teambook.panorama.domain.book.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.teambook.panorama.domain.book.dto.naver.NaverBookResponse;

@Component
public class NaverBookClient {

  private final RestClient naverRestClient;

  public NaverBookClient(RestClient naverRestClient){
    this.naverRestClient = naverRestClient;
  }

  //검색어로 책목록 갖고와서 -> NaverBookItem으로 받고 리스트 만들어서 NaverBookResponse로 내보내기 -> start, display, sort는 어떻게 할지 생각해볼 것
  //요청 보낼때 10개씩 받고 요청할때 
  public NaverBookResponse search(String keyword, Integer display, Integer start, String sort) {
    return naverRestClient.get()
    .uri("/v1/search/book.json?query={q}&display={d}&start={st}&sort={so}", keyword, display, start, sort)
    .retrieve()
    .body(NaverBookResponse.class);

  }
  //책 상세조회 여기서 하면 될 듯

}