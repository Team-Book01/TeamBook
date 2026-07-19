package com.teambook.panorama.domain.book.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.book.client.NaverBookClient;
import com.teambook.panorama.domain.book.dto.naver.NaverBookItem;
import com.teambook.panorama.domain.book.dto.review.MyReviewItem;
import com.teambook.panorama.domain.book.dto.review.MyReviewResponse;
import com.teambook.panorama.domain.book.dto.review.ReviewItem;
import com.teambook.panorama.domain.book.dto.review.ReviewRequest;
import com.teambook.panorama.domain.book.dto.review.ReviewResponse;
import com.teambook.panorama.domain.book.entity.Book;
import com.teambook.panorama.domain.book.entity.BookReview;
import com.teambook.panorama.domain.book.entity.ReviewStatus;
import com.teambook.panorama.domain.book.mapper.ReviewMapper;
import com.teambook.panorama.domain.book.repository.BookRepository;
import com.teambook.panorama.domain.book.repository.ReviewRepository;
import com.teambook.panorama.domain.user.repository.UserRepository;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {

  private final ReviewMapper reviewMapper;
  private final BookRepository bookRepository;
  private final ReviewRepository reviewRepository;
  private final NaverBookClient naverBookClient;
  private final UserRepository userRepository;

  //도서 리뷰목록 조회
  public ReviewResponse findByIsbn(String isbn, Long userId, int size, int page) {
    
    //offset 계산
    int offset = (page - 1) * size;
    
    //book 없을때 빈 배열 반환
    Optional<Book> book = bookRepository.findByIsbn(isbn);
    if (book.isEmpty()) {
      return ReviewResponse.builder()
      .page(page)
      .size(size)
      .total(0)
      .reviewItems(List.of())
      .ratingDistribution(initRatingDistribution())
      .build();
    }
    //bookId로 변환
    Long bookId = book.get().getBookId();
    
    //리뷰목록 total 계산
    int total = reviewMapper.selectTotalByBookId(bookId);

    //리뷰리스트 가져오기
    List<ReviewItem> reviews = reviewMapper.selectReviewsByBookId(bookId, userId, size, offset);
    
    //반환
    return ReviewResponse.builder()
    .page(page)
    .size(size)
    .total(total)
    .reviewItems(reviews)
    .ratingDistribution(calulateRatingDistribution(bookId))
    .build();
  }
  //리뷰 생성
  @Transactional
  public ReviewItem saveReview(ReviewRequest request, String isbn, Long userId) {
    //책DB있는지부터 조회 -> 생성 //예외 수정 필요
    Book book = bookRepository.findByIsbn(isbn).orElseGet(() -> {
      NaverBookItem naverBookItem = naverBookClient.search(isbn, 1, 1, "sim").items().getFirst();
      return
      bookRepository.save(Book.builder()
      .author(naverBookItem.author())
      .description(naverBookItem.description())
      .imageUrl(naverBookItem.image())
      .isbn(isbn)
      .pubdate(naverBookItem.pubdate())
      .publisher(naverBookItem.publisher())
      .shopUrl(naverBookItem.link())
      .title(naverBookItem.title())
      .build());
    });
    if(reviewRepository.existsByUserIdAndBook_BookIdAndStatus(userId, book.getBookId(), ReviewStatus.ACTIVE)) {
      throw new BusinessException(ErrorCode.REVIEW_ALREADY_EXISTS);
    }
    //리뷰 생성
    BookReview review = reviewRepository.save(BookReview.builder()
    .book(book)
    .content(request.content())
    .rating(request.rating())
    .userId(userId)
    .build());
  //리턴 값 예외 수정 필요
  return ReviewItem.builder()
  .content(review.getContent())
  .createdAt(review.getCreatedAt())
  .isMine(true)
  .nickname(userRepository.findById(userId).orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND)).getNickname())
  .rating(review.getRating())
  .reviewId(review.getReviewId())
  .build();  
  }
  //리뷰 수정
  @Transactional
  public ReviewItem updateReview(ReviewRequest request, Long reviewId, Long userId){
    BookReview foundReview = reviewRepository.findById(reviewId).orElseThrow(() -> new BusinessException(ErrorCode.REVIEW_NOT_FOUND));
    if (!foundReview.getUserId().equals(userId)) {
      throw new BusinessException(ErrorCode.NOT_REVIEW_OWNER);
    }
    foundReview.update(request.rating(), request.content(), foundReview.getStatus());
    String nickname = userRepository.findById(userId).orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND)).getNickname();
    return ReviewItem.builder()
    .content(request.content())
    .createdAt(foundReview.getCreatedAt())
    .isMine(true)
    .reviewId(reviewId)
    .nickname(nickname)
    .rating(request.rating())
    .build();
  }
  //리뷰 삭제하기
  @Transactional
  public void deleteReview(Long reviewId, Long userId){
    BookReview foundReview = reviewRepository.findById(reviewId).orElseThrow(() -> new BusinessException(ErrorCode.REVIEW_NOT_FOUND));
    if (!foundReview.getUserId().equals(userId)) {
      throw new BusinessException(ErrorCode.NOT_REVIEW_OWNER);
    }
    foundReview.update(foundReview.getRating(), foundReview.getContent(), ReviewStatus.DELETED);    
  }
  //마이페이지_리뷰개수
  public Long findMyReviewCount(Long userId){
    return reviewRepository.countByUserIdAndStatus(userId, ReviewStatus.ACTIVE);
  }
  //마이페이지_리뷰전체
  public MyReviewResponse findMyReviews(Long userId){
    //리뷰 전체 갖고오기
    List<BookReview> reviews = reviewRepository.findByUserIdAndStatus(userId, ReviewStatus.ACTIVE);
    //정보 매핑(list.of myReviewItem)
    List<MyReviewItem> myReviewItems = reviews.stream().map(review -> {
      return
      MyReviewItem.builder()
      .bookImage(review.getBook().getImageUrl())
      .bookTitle(review.getBook().getTitle())
      .content(review.getContent())
      .createdAt(review.getCreatedAt())
      .isbn(review.getBook().getIsbn())
      .rating(review.getRating())
      .reviewId(review.getReviewId())
      .build();
    }).toList();
    return new MyReviewResponse(myReviewItems.size(), myReviewItems);
  }
  



  //별점 분포 0으로 초기화해서 생성
  private Map<BigDecimal, Integer> initRatingDistribution() {
    Map<BigDecimal, Integer> distribution = new TreeMap<>();
    for (int i = 1; i <= 10; i++) {
        distribution.put(BigDecimal.valueOf(i * 5, 1), 0);  // 0.5, 1.0, ... 5.0
    }
    return distribution;
}
  //실제 값 덮어쓰기
  private Map<BigDecimal, Integer> calulateRatingDistribution(Long bookId) {
    Map<BigDecimal, Integer> distribution = initRatingDistribution();
    reviewMapper.selectRatingCountByBookId(bookId).stream().forEach(rc ->  {
      distribution.put(rc.rating().setScale(1), rc.count());
    });
    return distribution;
  }



}
