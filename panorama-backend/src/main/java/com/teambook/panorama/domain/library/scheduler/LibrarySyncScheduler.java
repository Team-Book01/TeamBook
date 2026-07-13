package com.teambook.panorama.domain.library.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.teambook.panorama.domain.library.dto.LibrarySyncResult;
import com.teambook.panorama.domain.library.service.LibrarySyncService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 도서관 데이터 자동 동기화 스케줄러.
 *
 * <p>매월 1일 새벽 4시(Asia/Seoul)에 정보나루 데이터를 전체 upsert 한다.
 * 수동 실행({@code POST /api/v1/admin/libraries/sync})과 동일한 로직을 재사용한다.
 * 정보나루 도서관 목록은 자주 바뀌지 않으므로 월 1회 주기로 충분하다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LibrarySyncScheduler {

  private final LibrarySyncService librarySyncService;

  /** 매월 1일 04:00 (초 분 시 일 월 요일). */
  @Scheduled(cron = "0 0 4 1 * *", zone = "Asia/Seoul")
  public void syncMonthly() {
    log.info("[library-sync] 월간 자동 동기화 시작");
    try {
      LibrarySyncResult result = librarySyncService.sync();
      log.info("[library-sync] 월간 자동 동기화 완료: {}", result);
    } catch (Exception e) {
      // 스케줄러에서 예외가 터지면 이후 실행이 막힐 수 있으므로 삼켜서 로그만 남긴다.
      log.error("[library-sync] 월간 자동 동기화 실패", e);
    }
  }
}
