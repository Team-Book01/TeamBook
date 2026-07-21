package com.teambook.panorama.domain.book.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.book.dto.review.MyReviewResponse;
import com.teambook.panorama.domain.book.dto.review.ReviewItem;
import com.teambook.panorama.domain.book.dto.review.ReviewRequest;
import com.teambook.panorama.domain.book.dto.review.ReviewResponse;
import com.teambook.panorama.domain.book.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
  @RequestParam(value = "page", defaultValue = "1") @Min(1) Integer page,
  @RequestParam(value = "size", defaultValue = "10") @Min(1) @Max(30) Integer size) 
  {
    ReviewResponse response = reviewService.findByIsbn(isbn, userId, size, page);
    return ResponseEntity.ok(response);
  }

  //리뷰 작성하기
  @Operation(summary = "리뷰 작성하기")
  @PostMapping("/{isbn}")
  public ResponseEntity<ReviewItem> createReview(@Valid @RequestBody ReviewRequest request,
  @PathVariable("isbn") String isbn,
  @AuthenticationPrincipal Long userId
  ){
    return ResponseEntity.ok(reviewService.createReview(request, isbn, userId));
  }
  //리뷰 수정하기
  @Operation(summary = "리뷰 수정하기")
  @PutMapping("{reviewId}")
  public ResponseEntity<ReviewItem> updateReview(@Valid @RequestBody ReviewRequest request,
    @PathVariable("reviewId") Long reviewId,
    @AuthenticationPrincipal Long userId
  ){
    return ResponseEntity.ok(reviewService.updateReview(request, reviewId, userId));
  }
  //리뷰 삭제하기
  @Operation(summary = "리뷰 삭제하기")
  @DeleteMapping("{reviewId}")
  public ResponseEntity<Void> deleteReview(@PathVariable("reviewId") Long reviewId,
    @AuthenticationPrincipal Long userId){
      reviewService.deleteReview(reviewId, userId);
      return ResponseEntity.noContent().build();
    }
  //마이페이지 리뷰 카운트
  @Operation(summary = "마이페이지 리뷰수 가져오기")
  @GetMapping("/myReviewCount")
  public ResponseEntity<Long> getMyReveiwCount(@AuthenticationPrincipal Long userId){
    return ResponseEntity.ok(reviewService.findMyReviewCount(userId));
  }
  //마이페이지 리뷰 전체
  @Operation(summary = "마이페이지 리뷰리스트 가져오기")
  @GetMapping("/myReviewList")
  public ResponseEntity<MyReviewResponse> getMyReviews(@AuthenticationPrincipal Long userId){
    return ResponseEntity.ok(reviewService.findMyReviews(userId));
  }
  //내 리뷰 단건 조회
  @Operation(summary = "도서 상세페이지용 내 리뷰 단 건 조회")
  @GetMapping("/myReview")
  public ResponseEntity<ReviewItem> getMyReview(@AuthenticationPrincipal Long userId, @RequestParam(value = "isbn") String isbn) {
    return ResponseEntity.ok(reviewService.findMyReveiw(userId, isbn));
  }

}
