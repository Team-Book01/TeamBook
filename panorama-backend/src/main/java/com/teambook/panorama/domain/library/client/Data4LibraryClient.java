package com.teambook.panorama.domain.library.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.teambook.panorama.domain.library.dto.LibrarySearchResponse;

import lombok.extern.slf4j.Slf4j;

/**
 * 정보나루(data4library) libSrch API 호출 클라이언트.
 * 인증키는 절대 하드코딩하지 않고 application.yml + 환경변수로 주입받는다.
 */
@Slf4j
@Component
public class Data4LibraryClient {

  /** 최초 1회 + 재시도 1회. */
  private static final int MAX_ATTEMPTS = 2;
  /** 재시도 전 대기. 순간적인 부하가 가라앉을 시간만 준다. */
  private static final long RETRY_DELAY_MS = 1_000L;

  private final RestClient data4LibraryRestClient;

  @Value("${data4library.auth-key}")
  private String authKey;

  public Data4LibraryClient(RestClient data4LibraryRestClient) {
    this.data4LibraryRestClient = data4LibraryRestClient;
  }

  /**
   * 도서관 목록을 페이지 단위로 조회한다. 일시적 실패는 1회 재시도한다.
   *
   * <p>수집은 전체가 성공해야 저장으로 넘어간다. 즉 <b>페이지 하나가 실패하면 16페이지치 수집이
   * 통째로 버려진다</b>(트랜잭션 롤백이 아니라, 저장 단계에 아예 도달하지 못한다).
   * 읽기 타임아웃·연결 끊김 같은 일시적 장애로 수 분치 작업을 날리는 건 손해가 커서,
   * 이 지점에서 한 번 더 시도해 흔한 실패를 흡수한다.
   *
   * <p>4xx 는 재시도하지 않는다. 잘못된 authKey/파라미터는 다시 불러도 같은 답이라
   * 1초만 낭비하고 똑같이 실패한다.
   *
   * @param pageNo   1부터 시작하는 페이지 번호
   * @param pageSize 페이지당 건수
   */
  public LibrarySearchResponse searchLibraries(int pageNo, int pageSize) {
    RestClientException lastError = null;

    for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        return doSearch(pageNo, pageSize);
      } catch (HttpClientErrorException e) {
        throw e; // 4xx → 재시도 무의미
      } catch (RestClientException e) {
        lastError = e;
        if (attempt >= MAX_ATTEMPTS) {
          break;
        }
        log.warn("[library-sync] 페이지 {} 조회 실패({}) → {}ms 후 재시도: {}",
            pageNo, e.getClass().getSimpleName(), RETRY_DELAY_MS, mask(e.getMessage()));
        if (!sleepBeforeRetry()) {
          break; // 인터럽트됨 → 더 붙잡지 않고 마지막 오류로 종료
        }
      }
    }
    throw lastError;
  }

  private LibrarySearchResponse doSearch(int pageNo, int pageSize) {
    return data4LibraryRestClient.get()
        .uri("/api/libSrch?authKey={key}&pageNo={no}&pageSize={size}&format=json",
            authKey, pageNo, pageSize)
        .retrieve()
        .body(LibrarySearchResponse.class);
  }

  /** @return 정상 대기했으면 true, 인터럽트되면 false */
  private boolean sleepBeforeRetry() {
    try {
      Thread.sleep(RETRY_DELAY_MS);
      return true;
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt(); // 인터럽트 상태를 삼키지 않는다
      return false;
    }
  }

  /**
   * 로그에 authKey 가 섞여 나가지 않도록 가린다.
   *
   * <p>정보나루는 헤더 인증을 지원하지 않아 authKey 가 URL 쿼리에 들어간다. 그런데 통신 오류 시
   * 스프링 예외 메시지에는 요청 URL 전체가 담기므로, 그대로 찍으면 인증키가 로그 파일에 평문으로 남는다.
   */
  private String mask(String text) {
    if (text == null || authKey == null || authKey.isBlank()) {
      return text;
    }
    return text.replace(authKey, "***");
  }
}
