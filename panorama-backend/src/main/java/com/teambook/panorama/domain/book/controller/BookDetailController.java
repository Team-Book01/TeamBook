package com.teambook.panorama.domain.book.controller;

import com.teambook.panorama.domain.book.service.BookSearchService;
import com.teambook.panorama.global.security.userdetails.CustomUserDetails;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.book.dto.detail.BookDetailResponse;
import com.teambook.panorama.domain.book.dto.search.BookSearchItem;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/books")
public class BookDetailController {
  private final BookSearchService bookSearchService;

  @Operation(summary = "도서 상세 조회")
  @GetMapping("/{isbn}")
  public ResponseEntity<BookDetailResponse> getBookDetail(@PathVariable("isbn") String isbn, @AuthenticationPrincipal CustomUserDetails userDetails){
    Long userId = (userDetails != null) ? userDetails.getUserId() : null;
    BookSearchItem item = bookSearchService.findBookByIsbn(isbn, userId);
    BookDetailResponse response = BookDetailResponse.of(item);
    return ResponseEntity.ok(response);
  }
}
