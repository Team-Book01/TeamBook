package com.teambook.panorama.domain.book.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.book.dto.review.ReviewResponse;
import com.teambook.panorama.domain.book.service.ReviewService;
import com.teambook.panorama.global.security.userdetails.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {
  private final ReviewService reviewService;

  //도서 리뷰 목록 가져오기
  @Operation(summary = "도서 리뷰 목록 불러오기")
  @GetMapping("/{isbn}")
  public ResponseEntity<ReviewResponse> getBookReviews(@PathVariable("isbn") String isbn, @AuthenticationPrincipal CustomUserDetails userDetails,
  @RequestParam(value = "page", defaultValue = "1") Integer page,
  @RequestParam(value = "size", defaultValue = "10") Integer size) 
  {
    Long userId = (userDetails != null) ? userDetails.getUserId() : null;
    ReviewResponse response = reviewService.findByIsbn(isbn, userId, size, page);
    return ResponseEntity.ok(response);
  }


}
