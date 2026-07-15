package com.teambook.panorama.domain.book.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

import org.springframework.stereotype.Service;
import com.teambook.panorama.domain.book.dto.review.ReviewItem;
import com.teambook.panorama.domain.book.dto.review.ReviewResponse;
import com.teambook.panorama.domain.book.entity.Book;
import com.teambook.panorama.domain.book.mapper.ReviewMapper;
import com.teambook.panorama.domain.book.repository.BookRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {

  private final ReviewMapper reviewMapper;
  private final BookRepository bookRepository;

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
