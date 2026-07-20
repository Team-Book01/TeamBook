package com.teambook.panorama.domain.library.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.teambook.panorama.domain.library.client.Data4LibraryClient;
import com.teambook.panorama.domain.library.dto.LibrarySearchResponse;
import com.teambook.panorama.domain.library.dto.LibrarySearchResponse.Lib;
import com.teambook.panorama.domain.library.dto.LibrarySearchResponse.LibItem;
import com.teambook.panorama.domain.library.dto.LibrarySearchResponse.Response;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 동기화 1단계 — 정보나루(data4library)에서 도서관 원본을 모아온다.
 *
 * <p><b>트랜잭션을 걸지 않는다.</b> 이 단계는 DB 와 아무 상관이 없는데 수 분이 걸린다(16페이지 × 왕복).
 * 예전에는 이 루프가 트랜잭션 안에 있어서, 네트워크 대기 시간 내내 DB 커넥션과 트랜잭션을 붙잡고 있었다.
 * 검증·저장은 {@link LibrarySyncWriter} 가 맡고, 트랜잭션은 거기서만 연다.
 *
 * <p>정제·검증은 하지 않는다. 원본을 그대로 넘기고 판단은 저장 단계에 모은다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LibrarySyncFetcher {

  /** 한 페이지에 가져올 건수. */
  private static final int PAGE_SIZE = 100;
  /** numFound 를 신뢰하되, 만약을 대비한 무한루프 방지용 상한(페이지). */
  private static final int MAX_PAGES = 1000;

  private final Data4LibraryClient data4LibraryClient;

  /**
   * libSrch 를 페이지 끝까지 조회해 원본 목록을 반환한다.
   *
   * @throws BusinessException 1페이지가 비었거나 numFound 가 0 이하인 경우
   *         (외부 API 오류를 "성공 0건"으로 위장시키지 않는다)
   */
  public List<Lib> fetchAll() {
    List<Lib> collected = new ArrayList<>();
    int pageNo = 1;

    while (pageNo <= MAX_PAGES) {
      LibrarySearchResponse body = data4LibraryClient.searchLibraries(pageNo, PAGE_SIZE);
      Response response = (body == null) ? null : body.response();
      List<LibItem> items = (response == null) ? null : response.libs();

      if (items == null || items.isEmpty()) {
        // 첫 페이지부터 데이터가 없으면 정상 종료가 아니라 인증/API 오류로 본다.
        // 정보나루는 authKey 가 틀려도 HTTP 200 + 에러 본문을 주므로, 여기서 걸러내지 않으면
        // 0건 처리가 "성공(200)"으로 위장되어 관리자가 동기화가 정상인 줄 오인한다.
        // (2페이지 이후의 빈 응답은 데이터 끝에 도달한 정상 종료로 간주하고 break)
        if (pageNo == 1) {
          throw new BusinessException(ErrorCode.LIBRARY_SYNC_FAILED,
              "정보나루 응답에 도서관 데이터가 없습니다(numFound="
                  + (response == null ? "null" : response.numFound())
                  + "). authKey/파라미터 또는 외부 API 상태를 확인하세요.");
        }
        break; // 데이터 끝에 도달 → 정상 종료
      }

      // numFound 는 아래 종료 조건(pageNo * PAGE_SIZE >= numFound)의 유일한 근거다.
      // record 의 primitive int 라 응답에 필드가 없으면 Jackson 이 0 을 넣는데, 그러면 첫 페이지에서
      // 100 >= 0 이 참이 되어 100건만 모으고 정상 종료한다. 위의 authKey 오류와 같은 종류의 위장이다.
      // (null 체크로는 잡히지 않는다. 0 인지 확인해야 한다)
      if (pageNo == 1 && response.numFound() <= 0) {
        throw new BusinessException(ErrorCode.LIBRARY_SYNC_FAILED,
            "정보나루 응답의 numFound 가 " + response.numFound() + " 입니다(항목은 "
                + items.size() + "건). 응답 형식 변경 또는 외부 API 상태를 확인하세요.");
      }

      for (LibItem item : items) {
        Lib lib = (item == null) ? null : item.lib(); // libs 원소는 {"lib": {...}} 래퍼
        if (lib != null) {
          collected.add(lib);
        }
      }

      // 전체 건수(numFound)를 넘겼으면 종료
      if ((long) pageNo * PAGE_SIZE >= response.numFound()) {
        break;
      }
      pageNo++;
    }

    if (pageNo > MAX_PAGES) {
      // 여기 닿았다는 건 numFound 가 비정상적으로 크거나 종료 조건이 안 먹었다는 뜻이다.
      // 조용히 끝내면 "일부만 수집됐는데 성공"으로 보이므로 흔적을 남긴다.
      log.warn("[library-sync] 페이지 상한({}) 도달 — 수집이 중간에 끊겼을 수 있다", MAX_PAGES);
    }
    log.info("[library-sync] 수집 완료: {}건", collected.size());
    return collected;
  }
}
