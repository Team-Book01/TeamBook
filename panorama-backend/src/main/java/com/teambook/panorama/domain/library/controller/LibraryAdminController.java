package com.teambook.panorama.domain.library.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.library.dto.LibrarySyncResult;
import com.teambook.panorama.domain.library.service.LibrarySyncService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "관리자 - 도서관 관리", description = "정보나루 도서관 데이터 동기화 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/libraries")
public class LibraryAdminController {

  private final LibrarySyncService librarySyncService;

  /**
   * 도서관 데이터 동기화(수동 실행).
   * 정보나루 libSrch 를 페이지 끝까지 조회해 lib_code 기준 upsert 한다.
   *
   * <p>자동 실행도 함께 돈다 — {@code LibrarySyncScheduler} 가 매월 1일 04:00(Asia/Seoul)에
   * 같은 {@code sync()} 를 호출한다. 그래서 이 API 는 "유일한 실행 경로"가 아니고,
   * 둘이 겹치는 경우는 {@code sync()} 의 락이 막아 진행 중이면 409 로 거절된다.
   */
  @Operation(summary = "도서관 데이터 동기화",
      description = "정보나루(data4library) libSrch 를 전체 페이지 조회하여 lib_code 기준으로 upsert 한다. 처리/신규/수정/건너뜀 건수와 완료 시각을 반환한다.")
  @PostMapping("/sync")
  public ResponseEntity<LibrarySyncResult> syncLibraries() {
    LibrarySyncResult result = librarySyncService.sync();
    return ResponseEntity.ok(result);
  }
}
