package com.teambook.panorama.domain.book.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.book.dto.search.BookSearchResponse;
import com.teambook.panorama.domain.book.service.BookSearchService;
import com.teambook.panorama.global.security.userdetails.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor

@RequestMapping("/api/v1/books")
public class BookSearchController {
  private final BookSearchService bookSearchService;

@Operation(summary = "책 검색")
@GetMapping("/search")
public ResponseEntity<BookSearchResponse> getBooks(
  @RequestParam(value = "keyword") String keyword,
  @RequestParam(value = "display", defaultValue = "10") Integer display,
  @RequestParam(value = "start", defaultValue = "1") Integer start,
  @RequestParam(value = "sort", defaultValue = "sim") String sort,
@AuthenticationPrincipal CustomUserDetails userDetails) {
    // 검색은 permitAll 이라 비로그인(익명) 요청이면 userDetails 가 null 이다.
    // 이 경우 userId 를 null 로 두면 북마크 조회가 빈 결과가 되어 정상 동작한다. (NPE 방지)
    Long userId = (userDetails != null) ? userDetails.getUserId() : null;
    BookSearchResponse response = bookSearchService.findBooks(keyword, display, start, sort, userId);
    return ResponseEntity.ok(response);
  }


}
