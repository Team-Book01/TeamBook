package com.teambook.panorama.domain.library.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.library.dto.LibrarySearchResponse.Lib;
import com.teambook.panorama.domain.library.dto.LibrarySyncResult;
import com.teambook.panorama.domain.library.entity.Library;
import com.teambook.panorama.domain.library.repository.LibraryRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 동기화 2단계 — 수집한 원본을 검증·정제해 DB 에 반영한다.
 *
 * <p><b>트랜잭션은 여기서만 연다.</b> 검증부터 저장까지가 한 단위여야 하고, 외부 HTTP 는 이미
 * {@link LibrarySyncFetcher} 에서 끝났으므로 이 트랜잭션은 네트워크를 기다리지 않는다.
 * DB 커넥션 점유 시간이 수 분에서 수 초로 줄어든다.
 *
 * <p>{@code @Transactional} 을 쓸 수 있는 이유 — 이 메서드는 {@link LibrarySyncService} 라는
 * <b>다른 빈</b>에서 호출된다. 스프링 프록시는 호출자에게 반환하기 <i>전에</i> 커밋을 끝내므로,
 * 호출자의 {@code unlock()} 은 자연히 커밋 이후가 된다. (같은 클래스 안에서 부르면 프록시를
 * 거치지 않아 트랜잭션이 아예 걸리지 않으니, 이 둘은 반드시 별도 빈으로 유지할 것)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LibrarySyncWriter {

  private final LibraryRepository libraryRepository;

  /**
   * lib_code 기준 upsert. 있으면 update(더티체킹), 없으면 insert.
   *
   * @param items {@link LibrarySyncFetcher} 가 모아온 원본 목록
   */
  @Transactional
  public LibrarySyncResult apply(List<Lib> items) {
    // 기존 전체를 lib_code 기준 맵으로 (upsert 판정용). 중복 lib_code 가 있으면 먼저 것을 사용.
    Map<String, Library> byLibCode = libraryRepository.findAll().stream()
        .collect(Collectors.toMap(Library::getLibCode, Function.identity(), (a, b) -> a, HashMap::new));

    List<Library> toInsert = new ArrayList<>();
    List<Library> toDelete = new ArrayList<>(); // 데이터 오류로 저장하지 않기로 한 기존 행
    int inserted = 0;
    int updated = 0;
    int skipped = 0;

    for (Lib lib : items) {
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

    // 삭제를 먼저 DB 에 내보낸다. Hibernate 는 한 flush 안에서 INSERT 를 DELETE 보다 먼저 실행하므로,
    // 원본에 같은 lib_code 가 중복으로 오고 (앞=좌표 불량 → 삭제 대상, 뒤=정상 → 신규) 인 경우
    // flush 를 나누지 않으면 아직 안 지워진 행과 UNIQUE(lib_code) 로 충돌해 동기화 전체가 롤백된다.
    libraryRepository.deleteAll(toDelete); // 데이터 오류로 더는 저장하지 않는 행 제거
    libraryRepository.flush();
    libraryRepository.saveAll(toInsert); // update 는 더티체킹으로 flush

    return new LibrarySyncResult(inserted + updated, inserted, updated, skipped,
        toDelete.size(), LocalDateTime.now());
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
