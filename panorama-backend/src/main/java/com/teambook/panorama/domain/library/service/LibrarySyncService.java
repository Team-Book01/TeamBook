package com.teambook.panorama.domain.library.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.teambook.panorama.domain.library.client.Data4LibraryClient;
import com.teambook.panorama.domain.library.dto.LibrarySearchResponse;
import com.teambook.panorama.domain.library.dto.LibrarySearchResponse.Lib;
import com.teambook.panorama.domain.library.dto.LibrarySearchResponse.LibItem;
import com.teambook.panorama.domain.library.dto.LibrarySearchResponse.Response;
import com.teambook.panorama.domain.library.dto.LibrarySyncResult;
import com.teambook.panorama.domain.library.entity.Library;
import com.teambook.panorama.domain.library.repository.LibraryRepository;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.extern.slf4j.Slf4j;

/**
 * 정보나루(data4library) 도서관 데이터를 우리 DB로 동기화한다.
 *
 * <p>
 * 흐름: libSrch 를 페이지 단위로 끝까지 조회 → lib_code 기준 upsert(있으면 update / 없으면 insert).
 * 동기화를 여러 번 돌려도 lib_code UNIQUE(V3) 덕분에 중복이 쌓이지 않는다.
 *
 * <p>
 * 학습/포트폴리오 단계라 단순함을 우선한다. 외부 HTTP 호출이 트랜잭션 안에서 일어나
 * 커넥션을 오래 잡는 트레이드오프가 있으나, 수동 실행 + 1,500여 건 규모라 이대로 둔다.
 */
@Slf4j
@Service
public class LibrarySyncService {

  /** 한 페이지에 가져올 건수. */
  private static final int PAGE_SIZE = 100;
  /** numFound 를 신뢰하되, 만약을 대비한 무한루프 방지용 상한(페이지). */
  private static final int MAX_PAGES = 1000;

  private final Data4LibraryClient data4LibraryClient;
  private final LibraryRepository libraryRepository;

  /**
   * 트랜잭션 경계를 코드로 직접 잡기 위해 사용한다.
   * (@Transactional 을 sync() 에 걸면 커밋이 메서드 리턴 "이후"라 락보다 늦게 끝난다 — 아래 sync() 주석 참고)
   */
  private final TransactionTemplate transactionTemplate;

  /**
   * 수동 실행(POST /admin/libraries/sync)과 월간 스케줄러의 동시 실행을 막는 락.
   * 둘이 겹치면 같은 findAll() 스냅샷 기준으로 같은 lib_code 를 insert 하려다
   * UNIQUE 제약 위반으로 한쪽이 롤백될 수 있어, 먼저 잡은 쪽만 실행하고 나머지는 즉시 거절한다.
   * (단일 인스턴스 기준. 다중 인스턴스로 확장하면 DB 락/분산락으로 교체 필요.)
   */
  private final ReentrantLock syncLock = new ReentrantLock();

  public LibrarySyncService(Data4LibraryClient data4LibraryClient,
      LibraryRepository libraryRepository, PlatformTransactionManager transactionManager) {
    this.data4LibraryClient = data4LibraryClient;
    this.libraryRepository = libraryRepository;
    this.transactionTemplate = new TransactionTemplate(transactionManager);
  }

  /**
   * 동기화 진입점. <b>락이 트랜잭션을 감싸야 한다.</b>
   *
   * <p>이 메서드에 {@code @Transactional} 을 걸면 안 된다. 스프링 프록시는 메서드가 리턴한 <i>뒤에</i>
   * 커밋하는데 {@code unlock()} 은 finally(리턴 직전)에서 실행되므로, "락은 풀렸는데 아직 커밋 안 된" 창이 생긴다.
   * 그 창에서 다른 동기화가 시작하면 {@code findAll()} 이 미커밋 insert 를 보지 못해 같은 lib_code 를 다시
   * insert 하고 UNIQUE 제약에 걸린다 — 락으로 막으려던 바로 그 상황이다.
   *
   * <p>그래서 트랜잭션을 어노테이션 대신 {@link TransactionTemplate} 으로 연다.
   * execute() 는 커밋까지 끝낸 뒤 반환하므로 unlock 이 항상 커밋 이후가 된다.
   */
  public LibrarySyncResult sync() {
    // 이미 동기화가 돌고 있으면 대기하지 않고 바로 거절(409). tryLock 은 즉시 반환하므로 커넥션을 붙잡지 않는다.
    if (!syncLock.tryLock()) {
      throw new BusinessException(ErrorCode.LIBRARY_SYNC_IN_PROGRESS);
    }
    try {
      return transactionTemplate.execute(status -> doSync());
    } finally {
      syncLock.unlock();
    }
  }

  private LibrarySyncResult doSync() {
    // 기존 전체를 lib_code 기준 맵으로 (upsert 판정용). 중복 lib_code 가 있으면 먼저 것을 사용.
    Map<String, Library> byLibCode = libraryRepository.findAll().stream()
        .collect(Collectors.toMap(Library::getLibCode, Function.identity(), (a, b) -> a, HashMap::new));

    List<Library> toInsert = new ArrayList<>();
    List<Library> toDelete = new ArrayList<>(); // 데이터 오류로 저장하지 않기로 한 기존 행
    int inserted = 0;
    int updated = 0;
    int skipped = 0;

    int pageNo = 1;
    while (pageNo <= MAX_PAGES) {
      LibrarySearchResponse body = data4LibraryClient.searchLibraries(pageNo, PAGE_SIZE);
      Response response = (body == null) ? null : body.response();
      List<LibItem> items = (response == null) ? null : response.libs();
      if (items == null || items.isEmpty()) {
        // 첫 페이지부터 데이터가 없으면 정상 종료가 아니라 인증/API 오류로 본다.
        // 정보나루는 authKey 가 틀려도 HTTP 200 + 에러 본문을 주므로, 여기서 걸러내지 않으면
        // 0건 처리가 "성공(200)"으로 위장되어 관리자가 동기화가 정상인 줄 오인한다. → 예외로 실패를 표면화.
        // (2페이지 이후의 빈 응답은 데이터 끝에 도달한 정상 종료로 간주하고 break)
        if (pageNo == 1) {
          throw new BusinessException(ErrorCode.LIBRARY_SYNC_FAILED,
              "정보나루 응답에 도서관 데이터가 없습니다(numFound="
                  + (response == null ? "null" : response.numFound())
                  + "). authKey/파라미터 또는 외부 API 상태를 확인하세요.");
        }
        break; // 데이터 끝에 도달 → 정상 종료
      }

      for (LibItem item : items) {
        Lib lib = (item == null) ? null : item.lib(); // libs 원소는 {"lib": {...}} 래퍼
        if (lib == null) {
          continue;
        }
        
        String libCode = emptyToNull(lib.libCode());
        String name = emptyToNull(lib.libName());
        String address = emptyToNull(lib.address());
        BigDecimal latitude = toBigDecimal(lib.latitude());
        BigDecimal longitude = toBigDecimal(lib.longitude());

        // NOT NULL 컬럼(lib_code/name/address/latitude/longitude) 중 하나라도 비면 insert 가
        // 실패하므로 건너뛴다.
        if (libCode == null || name == null || address == null || latitude == null || longitude == null) {
          skipped++;
          log.warn("[library-sync] 필수값 누락으로 건너뜀: libCode={}, name={}", lib.libCode(), lib.libName());
          continue;
        }

        // 원본의 알려진 오류 보정 (주소 → 이름 순서. 이름 보정이 보정된 주소의 시/도를 참조한다)
        address = LibraryDataSanitizer.normalizeAddress(address);
        name = LibraryDataSanitizer.normalizeName(name, address);

        // 좌표가 주소의 시/도와 어긋나면 원본이 깨진 것이다. 지도에 엉뚱한 도시로 찍히느니 빼는 게 낫다.
        if (!LibraryDataSanitizer.isCoordinatePlausible(address, latitude, longitude)) {
          skipped++;
          // 저장하지 않기로 한 이상, 예전 동기화 때 들어온 행이 남아 있으면 지워야 보정이 실제로 적용된다.
          // (원본 좌표가 고쳐지면 다음 동기화에서 다시 insert 되므로 되돌릴 수 있는 동작이다)
          Library stale = byLibCode.remove(libCode);
          if (stale != null) {
            toDelete.add(stale);
          }
          log.warn("[library-sync] 주소와 어긋나는 좌표 → 저장 안 함{}: libCode={}, name={}, address={}, lat={}, lng={}",
              stale != null ? " (기존 행 삭제)" : "", libCode, name, address, latitude, longitude);
          continue;
        }

        String tel = emptyToNull(lib.tel());
        String fax = emptyToNull(lib.fax());
        String homepageUrl = emptyToNull(lib.homepage());
        String closedDays = emptyToNull(lib.closed());
        String operatingHours = emptyToNull(lib.operatingTime());
        Integer bookCount = toInteger(lib.bookCount());

        Library existing = byLibCode.get(libCode);
        if (existing != null) {
          existing.update(name, address, tel, fax, latitude, longitude,
              homepageUrl, closedDays, operatingHours, bookCount);
          updated++;
        } else {
          Library created = Library.builder()
              .libCode(libCode)
              .name(name)
              .address(address)
              .tel(tel)
              .fax(fax)
              .latitude(latitude)
              .longitude(longitude)
              .homepageUrl(homepageUrl)
              .closedDays(closedDays)
              .operatingHours(operatingHours)
              .bookCount(bookCount)
              .build();
          byLibCode.put(libCode, created); // 같은 배치 내 중복 lib_code 재삽입 방지
          toInsert.add(created);
          inserted++;
        }
      }

      // 전체 건수(numFound)를 넘겼으면 종료
      if ((long) pageNo * PAGE_SIZE >= response.numFound()) {
        break;
      }
      pageNo++;
    }

    // 삭제를 먼저 DB 에 내보낸다. Hibernate 는 한 flush 안에서 INSERT 를 DELETE 보다 먼저 실행하므로,
    // 원본에 같은 lib_code 가 중복으로 오고 (앞=좌표 불량 → 삭제 대상, 뒤=정상 → 신규) 인 경우
    // flush 를 나누지 않으면 아직 안 지워진 행과 UNIQUE(lib_code) 로 충돌해 동기화 전체가 롤백된다.
    libraryRepository.deleteAll(toDelete); // 데이터 오류로 더는 저장하지 않는 행 제거
    libraryRepository.flush();
    libraryRepository.saveAll(toInsert); // update 는 더티체킹으로 flush

    LibrarySyncResult result = new LibrarySyncResult(inserted + updated, inserted, updated, skipped,
        toDelete.size(), LocalDateTime.now());
    log.info("[library-sync] 완료: {}", result);
    return result;
  }

  /** 빈 문자열/공백/"-" 는 모두 null 로 정규화. */
  private static String emptyToNull(String value) {
    if (value == null) {
      return null;
    }
    String trimmed = value.trim();
    return (trimmed.isEmpty() || "-".equals(trimmed)) ? null : trimmed;
  }

  /** 좌표 문자열 → BigDecimal. 파싱 실패 시 예외 대신 null(1건 때문에 전체 동기화가 죽지 않도록). */
  private static BigDecimal toBigDecimal(String value) {
    String normalized = emptyToNull(value);
    if (normalized == null) {
      return null;
    }
    try {
      return new BigDecimal(normalized);
    } catch (NumberFormatException e) {
      return null;
    }
  }

  /** 소장 도서 수 문자열 → Integer. 파싱 실패 시 null. */
  private static Integer toInteger(String value) {
    String normalized = emptyToNull(value);
    if (normalized == null) {
      return null;
    }
    try {
      return Integer.parseInt(normalized);
    } catch (NumberFormatException e) {
      return null;
    }
  }
}
