package com.teambook.panorama.domain.book.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.teambook.panorama.domain.book.dto.search.BookSearchResponse;
import com.teambook.panorama.domain.book.service.BookSearchService;
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
@AuthenticationPrincipal Long userId) {
    BookSearchResponse response = bookSearchService.findBooks(keyword, display, start, sort, userId);
    return ResponseEntity.ok(response);
  }


}
