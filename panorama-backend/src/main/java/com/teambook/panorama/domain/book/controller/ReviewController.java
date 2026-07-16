package com.teambook.panorama.domain.book.controller;

import org.apache.catalina.connector.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.book.dto.review.ReviewItem;
import com.teambook.panorama.domain.book.dto.review.ReviewRequest;
import com.teambook.panorama.domain.book.dto.review.ReviewResponse;
import com.teambook.panorama.domain.book.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {
  private final ReviewService reviewService;

  //도서 리뷰 목록 가져오기
  @Operation(summary = "도서 리뷰 목록 불러오기")
  @GetMapping("/{isbn}")
  public ResponseEntity<ReviewResponse> getBookReviews(@PathVariable("isbn") String isbn, @AuthenticationPrincipal Long userId,
  @RequestParam(value = "page", defaultValue = "1") Integer page,
  @RequestParam(value = "size", defaultValue = "10") Integer size) 
  {
    ReviewResponse response = reviewService.findByIsbn(isbn, userId, size, page);
    return ResponseEntity.ok(response);
  }

  //리뷰 작성하기
  @Operation
  @PostMapping("/{isbn}")
  public ResponseEntity<ReviewItem> createReview(@Valid @RequestBody ReviewRequest request,
  @PathVariable("isbn") String isbn,
  @AuthenticationPrincipal Long userId
  ){
    return ResponseEntity.ok(reviewService.saveReview(request, isbn, userId));
  }
  //리뷰 수정하기
  @Operation
  @PutMapping("{reviewId}")
  public ResponseEntity<ReviewItem> updateReview(@Valid @RequestBody ReviewRequest request,
    @PathVariable("reviewId") Long reviewId,
    @AuthenticationPrincipal Long userId
  ){
    return ResponseEntity.ok(reviewService.updateReveiw(request, reviewId, userId));
  }
  //리뷰 삭제하기
  @Operation
  @DeleteMapping("{reviewId}")
  public ResponseEntity<Void> deleteReview(@PathVariable("reviewId") Long reviewId,
    @AuthenticationPrincipal Long userId){
      reviewService.deleteReveiw(reviewId, userId);
      return ResponseEntity.noContent().build();
    }

}
