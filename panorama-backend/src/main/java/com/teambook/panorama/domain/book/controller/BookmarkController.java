package com.teambook.panorama.domain.book.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.book.dto.bookmark.BookmarkRequest;
import com.teambook.panorama.domain.book.dto.bookmark.BookmarkResponse;
import com.teambook.panorama.domain.book.dto.bookmark.MyBookmarkResponse;
import com.teambook.panorama.domain.book.service.BookmarkService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/bookmark")
public class BookmarkController {

  private final BookmarkService bookmarkService;

  @Operation(summary = "북마크 토글")
  @PostMapping("/toggle")
  public ResponseEntity<BookmarkResponse> toggleBookmark(@RequestBody @Valid BookmarkRequest request, @AuthenticationPrincipal Long userId) {
    BookmarkResponse response = bookmarkService.toggleBookmark(request, userId);
    return ResponseEntity.ok(response);
  }

  //마이페이지 북마크 수
  @Operation(summary = "마이페이지 북마크 수")
  @GetMapping("/myBookmarkCount")
  public ResponseEntity<Long> getMyBookmarkCount(@AuthenticationPrincipal Long userId) {
    return ResponseEntity.ok(bookmarkService.findMyBookmarkCount(userId));
  }
  //마이페이지 북마크 리스트
  @Operation(summary = "마이페이지 북마크 리스트")
  @GetMapping("/myBookmarks")
  public ResponseEntity<MyBookmarkResponse> getMyBookmarks(@AuthenticationPrincipal Long userId) {
    return ResponseEntity.ok(bookmarkService.findMyBookmarks(userId));
  }
  
}
