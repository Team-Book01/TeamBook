package com.teambook.panorama.domain.book.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.book.dto.bookmark.BookmarkRequest;
import com.teambook.panorama.domain.book.dto.bookmark.BookmarkResponse;
import com.teambook.panorama.domain.book.service.BookmarkService;
import com.teambook.panorama.global.security.userdetails.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/books")
public class BookmarkController {

  private final BookmarkService bookmarkService;

  @Operation(summary = "북마크 토글")
  @PostMapping("/bookmark")
  public ResponseEntity<BookmarkResponse> toggleBookmark(@RequestBody @Valid BookmarkRequest request, @AuthenticationPrincipal CustomUserDetails userDetails) {
    Long userId = userDetails.getUserId();
    BookmarkResponse response = bookmarkService.toggleBookmark(request, userId);
    return ResponseEntity.ok(response);
  }

}
