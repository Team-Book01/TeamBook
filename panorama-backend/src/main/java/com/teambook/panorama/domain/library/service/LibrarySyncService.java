package com.teambook.panorama.domain.library.service;

import java.util.List;
import java.util.concurrent.locks.ReentrantLock;

import org.springframework.stereotype.Service;

import com.teambook.panorama.domain.library.dto.LibrarySearchResponse.Lib;
import com.teambook.panorama.domain.library.dto.LibrarySyncResult;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 정보나루(data4library) 도서관 데이터를 우리 DB로 동기화한다. 이 클래스는 <b>조율만</b> 한다.
 *
 * <pre>
 *   sync()  ─ 락 ─┬─ LibrarySyncFetcher.fetchAll()  수집   (트랜잭션 없음, 수 분)
 *                 └─ LibrarySyncWriter.apply(...)   검증·저장 (트랜잭션, 수 초)
 * </pre>
 *
 * <p>예전에는 수집과 저장이 한 메서드 · 한 트랜잭션이었다. 그래서 정보나루를 16번 호출하는 내내
 * DB 커넥션과 트랜잭션을 붙잡고 있었고, 페이지 하나가 느려 타임아웃이 나면 수 분짜리 트랜잭션이
 * 통째로 롤백됐다. DB 와 무관한 대기 시간을 트랜잭션 밖으로 빼는 게 이 분리의 목적이다.
 *
 * <p>덤으로 트랜잭션 경계를 {@code TransactionTemplate} 으로 직접 잡을 필요도 없어졌다.
 * 트랜잭션이 다른 빈({@link LibrarySyncWriter})의 메서드에 걸리면서, 프록시가 <b>반환 전에</b>
 * 커밋을 끝내기 때문이다. 아래 {@code unlock()} 은 자연히 커밋 이후가 된다.
 * (이 메서드 자신에 {@code @Transactional} 을 걸면 커밋이 메서드 리턴 이후라 unlock 보다 늦어진다 —
 *  그러면 "락은 풀렸는데 미커밋"인 창이 열려, 그 사이 시작된 동기화가 UNIQUE 제약에 걸린다)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LibrarySyncService {

  private final LibrarySyncFetcher librarySyncFetcher;
  private final LibrarySyncWriter librarySyncWriter;

  /**
   * 수동 실행(POST /admin/libraries/sync)과 월간 스케줄러의 동시 실행을 막는 락.
   * 둘이 겹치면 같은 findAll() 스냅샷 기준으로 같은 lib_code 를 insert 하려다
   * UNIQUE 제약 위반으로 한쪽이 롤백될 수 있어, 먼저 잡은 쪽만 실행하고 나머지는 즉시 거절한다.
   * (단일 인스턴스 기준. 다중 인스턴스로 확장하면 DB 락/분산락으로 교체 필요.)
   */
  private final ReentrantLock syncLock = new ReentrantLock();

  public LibrarySyncResult sync() {
    // 이미 동기화가 돌고 있으면 대기하지 않고 바로 거절(409). tryLock 은 즉시 반환하므로 스레드를 붙잡지 않는다.
    if (!syncLock.tryLock()) {
      throw new BusinessException(ErrorCode.LIBRARY_SYNC_IN_PROGRESS);
    }
    try {
      List<Lib> items = librarySyncFetcher.fetchAll();
      LibrarySyncResult result = librarySyncWriter.apply(items);
      log.info("[library-sync] 완료: {}", result);
      return result;
    } finally {
      syncLock.unlock();
    }
  }
}
