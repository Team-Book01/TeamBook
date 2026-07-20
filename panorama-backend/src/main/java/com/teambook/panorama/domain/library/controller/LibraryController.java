package com.teambook.panorama.domain.library.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.library.dto.LibraryResponse;
import com.teambook.panorama.domain.library.service.LibraryQueryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "도서관 지도", description = "도서관 위치(위경도) 조회 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/libraries")
public class LibraryController {

  private final LibraryQueryService libraryQueryService;

  /**
   * 지도에 뿌릴 전체 도서관 목록(좌표 포함). 비로그인도 접근 가능(SecurityConfig 화이트리스트).
   */
  @Operation(summary = "도서관 목록 조회",
      description = "지도 마커용 전체 도서관 목록을 위경도와 함께 반환한다.")
  @GetMapping
  public ResponseEntity<List<LibraryResponse>> getLibraries() {
    return ResponseEntity.ok(libraryQueryService.getLibraries());
  }
}
