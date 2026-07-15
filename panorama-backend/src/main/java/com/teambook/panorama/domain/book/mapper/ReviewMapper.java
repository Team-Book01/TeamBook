package com.teambook.panorama.domain.book.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.teambook.panorama.domain.book.dto.review.RatingCount;
import com.teambook.panorama.domain.book.dto.review.ReviewItem;

@Mapper
public interface ReviewMapper {
  List<ReviewItem> selectReviewsByBookId(@Param("bookId") Long bookId,
  @Param("userId") Long userId,
  @Param("size") int size,
  @Param("offset") int offset);

  Integer selectTotalByBookId(@Param("bookId") Long bookId);

  List<RatingCount> selectRatingCountByBookId(@Param("bookId") Long bookId );

} 
